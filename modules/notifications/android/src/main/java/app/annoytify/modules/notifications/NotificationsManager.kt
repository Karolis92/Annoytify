package app.annoytify.modules.notifications

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import kotlin.math.max

internal object NotificationsManager {
  private const val notificationTagId = 0

  fun setNotificationChannels(
    context: Context,
    channels: List<NotificationChannelRecord>
  ) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val notificationManager = context.getSystemService(NotificationManager::class.java)
    channels.forEach { channel ->
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
    if (canScheduleExactAlarms(context)) {
      return true
    }

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return true
    }

    val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
      data = Uri.parse("package:${context.packageName}")
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    val fallbackIntent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
      data = Uri.fromParts("package", context.packageName, null)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    val settingsIntent = if (intent.resolveActivity(context.packageManager) != null) {
      intent
    } else {
      fallbackIntent
    }

    context.startActivity(settingsIntent)
    return false
  }

  fun displayNotification(context: Context, notification: NotificationRequestRecord) {
    NotificationManagerCompat.from(context).notify(
      notification.id,
      notificationTagId,
      buildNotification(context, notification)
    )
  }

  fun scheduleNotification(
    context: Context,
    notification: NotificationRequestRecord,
    timestamp: Long
  ) {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val triggerAtMillis = max(timestamp, System.currentTimeMillis() + 1000)
    val pendingIntent = createSchedulePendingIntent(context, notification.id, notification)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
      throw IllegalStateException(
        "Exact alarm permission is required to schedule notifications on Android 12+."
      )
    }

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

  fun cancelNotification(context: Context, id: String) {
    NotificationManagerCompat.from(context).cancel(id, notificationTagId)

    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    alarmManager.cancel(createSchedulePendingIntent(context, id))
  }

  private fun buildNotification(
    context: Context,
    notification: NotificationRequestRecord
  ): android.app.Notification {
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

  private fun createRequestCode(id: String, route: String): Int {
    return (id.hashCode() * 31 + route.hashCode())
  }

  private fun resolveSmallIcon(context: Context): Int {
    return context.applicationInfo.icon.takeIf { it != 0 }
      ?: android.R.drawable.ic_dialog_info
  }
}
