package app.annoytify.modules.notifications

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import kotlin.math.max

internal object NotificationsManager {
  private const val notificationTagId = 0
  private const val defaultChannelId = "reminders"
  private const val defaultChannelName = "Reminders"
  private const val minimumScheduleDelayMillis = 1_000L
  private const val requestCodeHashPrime = 31L
  private const val requestCodeMask = 0x7fffffffL

  fun setNotificationChannels(
    context: Context,
    channels: List<NotificationChannelRecord>
  ) {
    NotificationsStorage.setChannels(context, channels)

    if (channels.isNotEmpty()) {
      ensureNotificationChannels(context, channels)
    }
  }

  fun restorePersistedNotifications(context: Context) {
    ensureNotificationChannels(context)

    val nowMillis = System.currentTimeMillis()
    NotificationsStorage.getReminders(context).forEach { reminder ->
      applyReminder(context, reminder, nowMillis, throwOnBlocked = false)
    }
  }

  fun handleNotificationEvent(
    context: Context,
    notification: NotificationRequestRecord,
    eventType: String
  ) {
    if (eventType == NotificationsConstants.eventDismissed && notification.ongoing) {
      Log.i(
        NotificationsLogger.tag,
        "Re-displaying ongoing notification after dismiss for id=${notification.id}"
      )
      displayNotification(context, notification)
    }
  }

  fun areNotificationsEnabled(context: Context): Boolean {
    return NotificationManagerCompat.from(context).areNotificationsEnabled()
  }

  fun canScheduleExactAlarms(context: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return true
    }

    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    return alarmManager.canScheduleExactAlarms()
  }

  fun requestExactAlarmPermission(context: Context): Boolean {
    if (canScheduleExactAlarms(context) || Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return true
    }

    val requestIntent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
      data = Uri.parse("package:${context.packageName}")
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    val fallbackIntent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
      data = Uri.fromParts("package", context.packageName, null)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    context.startActivity(
      if (requestIntent.resolveActivity(context.packageManager) != null) {
        requestIntent
      } else {
        fallbackIntent
      }
    )

    return false
  }

  fun displayNotification(
    context: Context,
    notification: NotificationRequestRecord,
    triggerAtMillis: Long = System.currentTimeMillis()
  ) {
    ensureNotificationChannels(context, notification)

    NotificationManagerCompat.from(context).notify(
      notification.id,
      notificationTagId,
      buildNotification(context, notification)
    )

    NotificationsStorage.upsertReminder(
      context,
      PersistedReminderRecord(
        notification = notification,
        triggerAtMillis = triggerAtMillis,
        state = PersistedReminderState.Displayed
      )
    )
  }

  fun scheduleNotification(
    context: Context,
    notification: NotificationRequestRecord,
    timestamp: Long
  ) {
    ensureNotificationChannels(context, notification)

    applyReminder(
      context,
      PersistedReminderRecord(
        notification = notification,
        triggerAtMillis = timestamp,
        state = PersistedReminderState.Scheduled
      ),
      System.currentTimeMillis(),
      throwOnBlocked = true
    )
  }

  fun cancelNotification(context: Context, id: String) {
    NotificationManagerCompat.from(context).cancel(id, notificationTagId)

    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    alarmManager.cancel(createSchedulePendingIntent(context, id))
    NotificationsStorage.removeReminder(context, id)
  }

  private fun applyReminder(
    context: Context,
    reminder: PersistedReminderRecord,
    nowMillis: Long,
    throwOnBlocked: Boolean
  ) {
    when (
      ReminderRestorePlanner.decide(
        triggerAtMillis = reminder.triggerAtMillis,
        nowMillis = nowMillis,
        canScheduleExactAlarms = canScheduleExactAlarms(context)
      )
    ) {
      ReminderRestoreAction.Display -> displayNotification(
        context,
        reminder.notification,
        reminder.triggerAtMillis
      )

      ReminderRestoreAction.Schedule -> {
        scheduleExactAlarm(context, reminder.notification, reminder.triggerAtMillis)
        NotificationsStorage.upsertReminder(
          context,
          reminder.copy(state = PersistedReminderState.Scheduled)
        )
      }

      ReminderRestoreAction.WaitForExactAlarmPermission -> {
        Log.w(
          NotificationsLogger.tag,
          "Exact alarm permission is missing for notification id=${reminder.notification.id}"
        )
        NotificationsStorage.upsertReminder(
          context,
          reminder.copy(state = PersistedReminderState.Blocked)
        )

        if (throwOnBlocked) {
          throw IllegalStateException(
            "Exact alarm permission is required to schedule notifications on Android 12+."
          )
        }
      }
    }
  }

  private fun scheduleExactAlarm(
    context: Context,
    notification: NotificationRequestRecord,
    timestamp: Long
  ) {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val triggerAtMillis = max(timestamp, System.currentTimeMillis() + minimumScheduleDelayMillis)
    val pendingIntent = createSchedulePendingIntent(context, notification.id, notification)

    when {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ->
        alarmManager.setExactAndAllowWhileIdle(
          AlarmManager.RTC_WAKEUP,
          triggerAtMillis,
          pendingIntent
        )

      Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT ->
        alarmManager.setExact(
          AlarmManager.RTC_WAKEUP,
          triggerAtMillis,
          pendingIntent
        )

      else ->
        alarmManager.set(
          AlarmManager.RTC_WAKEUP,
          triggerAtMillis,
          pendingIntent
        )
    }
  }

  private fun ensureNotificationChannels(
    context: Context,
    channels: List<NotificationChannelRecord> = NotificationsStorage.getChannels(context)
  ): List<NotificationChannelRecord> {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return channels
    }

    val resolvedChannels = channels.ifEmpty {
      listOf(
        NotificationChannelRecord(
          id = defaultChannelId,
          name = defaultChannelName
        )
      )
    }

    val notificationManager = context.getSystemService(NotificationManager::class.java)
    resolvedChannels.forEach { channel ->
      notificationManager.createNotificationChannel(
        NotificationChannel(
          channel.id,
          channel.name,
          NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
          description = channel.description
        }
      )
    }

    return resolvedChannels
  }

  private fun ensureNotificationChannels(
    context: Context,
    notification: NotificationRequestRecord
  ) {
    val storedChannels = NotificationsStorage.getChannels(context)

    if (storedChannels.any { it.id == notification.channelId }) {
      ensureNotificationChannels(context, storedChannels)
      return
    }

    val mergedChannels = storedChannels + NotificationChannelRecord(
      id = notification.channelId,
      name = notification.channelId
    )
    NotificationsStorage.setChannels(context, mergedChannels)
    ensureNotificationChannels(context, mergedChannels)
  }

  private fun buildNotification(
    context: Context,
    notification: NotificationRequestRecord
  ): Notification {
    val builder = NotificationCompat.Builder(context, notification.channelId)
      .setSmallIcon(resolveSmallIcon(context))
      .setContentTitle(notification.title)
      .setOngoing(notification.ongoing)
      .setAutoCancel(notification.autoCancel)
      .setPriority(NotificationCompat.PRIORITY_DEFAULT)
      .setDeleteIntent(
        createEventPendingIntent(
          context = context,
          notification = notification,
          eventType = NotificationsConstants.eventDismissed,
          route = "dismiss"
        )
      )
      .setContentIntent(
        createContentPendingIntent(context, notification)
      )

    if (!notification.body.isNullOrEmpty()) {
      builder
        .setContentText(notification.body)
        .setStyle(NotificationCompat.BigTextStyle().bigText(notification.body))
    }

    notification.actions.forEach { action ->
      builder.addAction(
        0,
        action.title,
        createEventPendingIntent(
          context = context,
          notification = notification,
          eventType = NotificationsConstants.eventActionPressed,
          actionId = action.id,
          route = "action/${Uri.encode(action.id)}"
        )
      )
    }

    return builder.build()
  }

  private fun createSchedulePendingIntent(
    context: Context,
    id: String,
    notification: NotificationRequestRecord? = null
  ): PendingIntent {
    val intent = Intent(context, ScheduledNotificationReceiver::class.java).apply {
      action = NotificationsConstants.actionScheduledNotification
      data = Uri.parse("annoytify://notifications/${Uri.encode(id)}/schedule")
    }

    if (notification != null) {
      intent.putExtra(
        NotificationsConstants.extraNotificationJson,
        NotificationsJson.serializeNotification(notification)
      )
    }

    return PendingIntent.getBroadcast(
      context,
      createRequestCode(id, "schedule"),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  private fun createEventPendingIntent(
    context: Context,
    notification: NotificationRequestRecord,
    eventType: String,
    route: String,
    actionId: String? = null
  ): PendingIntent {
    val intent = Intent(context, NotificationEventReceiver::class.java).apply {
      action = NotificationsConstants.actionNotificationEvent
      data = Uri.parse("annoytify://notifications/${Uri.encode(notification.id)}/$route")
      putExtra(
        NotificationsConstants.extraNotificationJson,
        NotificationsJson.serializeNotification(notification)
      )
      putExtra(NotificationsConstants.extraEventType, eventType)
      actionId?.let {
        putExtra(NotificationsConstants.extraActionId, it)
      }
    }

    return PendingIntent.getBroadcast(
      context,
      createRequestCode(notification.id, route),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  private fun createContentPendingIntent(
    context: Context,
    notification: NotificationRequestRecord
  ): PendingIntent {
    val notificationJson = NotificationsJson.serializeNotification(notification)
    val launchIntent = context.packageManager
      .getLaunchIntentForPackage(context.packageName)
      ?.apply {
        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_SINGLE_TOP or
            Intent.FLAG_ACTIVITY_CLEAR_TOP
        )
        putExtra(NotificationsConstants.extraNotificationJson, notificationJson)
        putExtra(NotificationsConstants.extraEventType, NotificationsConstants.eventPressed)
      }

    return if (launchIntent != null) {
      PendingIntent.getActivity(
        context,
        createRequestCode(notification.id, "content"),
        launchIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
    } else {
      createEventPendingIntent(
        context = context,
        notification = notification,
        eventType = NotificationsConstants.eventPressed,
        route = "press"
      )
    }
  }

  // Combine the notification id and route into a stable positive request code so each
  // PendingIntent remains distinct while still fitting within Android's signed Int API.
  private fun createRequestCode(id: String, route: String): Int {
    return ((id.hashCode() * requestCodeHashPrime + route.hashCode().toLong()) and
      requestCodeMask).toInt()
  }

  private fun resolveSmallIcon(context: Context): Int {
    return context.applicationInfo.icon.takeIf { it != 0 }
      ?: android.R.drawable.ic_dialog_info
  }
}
