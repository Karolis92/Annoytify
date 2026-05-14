package expo.modules.notifications

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.drawable.Icon
import android.net.Uri
import android.os.Build
import android.provider.Settings
import java.util.Locale
import kotlin.math.max

internal object NotificationHelper {
  fun canScheduleExactAlarms(context: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return true
    }
    return alarmManager(context).canScheduleExactAlarms()
  }

  fun openExactAlarmSettings(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return
    }

    val intent = Intent(
      Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
      Uri.parse("package:${context.packageName}")
    ).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK
    }
    context.startActivity(intent)
  }

  fun display(context: Context, payload: NotificationPayload) {
    createChannel(context, payload.channelId)
    notificationManager(context).notify(notificationId(payload.id), buildNotification(context, payload))
  }

  fun schedule(context: Context, payload: NotificationPayload, timestamp: Long): Boolean {
    val triggerAtMillis = max(timestamp, System.currentTimeMillis() + 1000)
    val intent = Intent(context, NotificationAlarmReceiver::class.java).apply {
      action = NotificationConstants.ACTION_ALARM
      payload.putInto(this)
    }
    val pendingIntent = PendingIntent.getBroadcast(
      context,
      requestCode(payload.id, NotificationConstants.ACTION_ALARM),
      intent,
      pendingIntentFlags()
    )

    val alarm = alarmManager(context)
    val canScheduleExact = canScheduleExactAlarms(context)
    if (canScheduleExact && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
    } else if (canScheduleExact) {
      alarm.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
    } else {
      alarm.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
    }
    return canScheduleExact
  }

  fun cancel(context: Context, id: String) {
    notificationManager(context).cancel(notificationId(id))
    val emptyIntent = Intent(context, NotificationAlarmReceiver::class.java).apply {
      action = NotificationConstants.ACTION_ALARM
    }
    val pendingIntent = PendingIntent.getBroadcast(
      context,
      requestCode(id, NotificationConstants.ACTION_ALARM),
      emptyIntent,
      pendingIntentFlags()
    )
    alarmManager(context).cancel(pendingIntent)
  }

  fun eventIntent(
    context: Context,
    payload: NotificationPayload,
    eventAction: String,
    eventType: String,
    pressActionId: String? = null
  ): PendingIntent {
    val intent = Intent(context, NotificationEventReceiver::class.java).apply {
      action = eventAction
      putExtra(NotificationConstants.EXTRA_EVENT_TYPE, eventType)
      putExtra(NotificationConstants.EXTRA_PRESS_ACTION_ID, pressActionId)
      payload.putInto(this)
    }
    return PendingIntent.getBroadcast(
      context,
      requestCode(payload.id, "$eventAction:${pressActionId.orEmpty()}"),
      intent,
      pendingIntentFlags()
    )
  }

  fun openAppIntent(context: Context, payload: NotificationPayload): PendingIntent {
    val intent = requireNotNull(
      context.packageManager.getLaunchIntentForPackage(context.packageName)
    ) {
      "Unable to resolve launch intent for ${context.packageName}"
    }.apply {
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_CLEAR_TOP or
          Intent.FLAG_ACTIVITY_SINGLE_TOP
      )
    }

    return PendingIntent.getActivity(
      context,
      requestCode(payload.id, "openApp"),
      intent,
      pendingIntentFlags()
    )
  }

  fun startEventTask(context: Context, intent: Intent?) {
    val serviceIntent = Intent(context, NotificationEventTaskService::class.java)
    if (intent != null) {
      serviceIntent.putExtras(intent)
    }
    context.startService(serviceIntent)
    com.facebook.react.HeadlessJsTaskService.acquireWakeLockNow(context)
  }

  private fun buildNotification(context: Context, payload: NotificationPayload): Notification {
    val builder =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        Notification.Builder(context, payload.channelId)
      } else {
        @Suppress("DEPRECATION")
        Notification.Builder(context)
      }

    builder
      .setSmallIcon(resolveSmallIcon(context))
      .setContentTitle(payload.title)
      .setContentText(payload.body.orEmpty())
      .setOngoing(payload.ongoing)
      .setAutoCancel(payload.autoCancel)
      .setShowWhen(true)
      .setWhen(System.currentTimeMillis())
      .setDeleteIntent(
        eventIntent(
          context,
          payload,
          NotificationConstants.ACTION_DISMISSED,
          NotificationConstants.EVENT_DISMISSED
        )
      )
      .setContentIntent(
        openAppIntent(context, payload)
      )

    if (!payload.body.isNullOrBlank()) {
      builder.setStyle(Notification.BigTextStyle().bigText(payload.body))
    }

    payload.actions.forEach { action ->
      builder.addAction(
        Notification.Action.Builder(
          resolveSmallIconAsIcon(context),
          action.title,
          eventIntent(
            context,
            payload,
            NotificationConstants.ACTION_ACTION_PRESS,
            NotificationConstants.EVENT_ACTION_PRESS,
            action.id
          )
        ).build()
      )
    }

    return builder.build()
  }

  private fun createChannel(context: Context, channelId: String) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val channel = NotificationChannel(
      channelId,
      NotificationConstants.CHANNEL_NAME,
      NotificationManager.IMPORTANCE_DEFAULT
    )
    notificationManager(context).createNotificationChannel(channel)
  }

  private fun notificationManager(context: Context): NotificationManager =
    context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

  private fun alarmManager(context: Context): AlarmManager =
    context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

  private fun resolveSmallIcon(context: Context): Int {
    return R.drawable.annoytify_notification_small
  }

  private fun resolveSmallIconAsIcon(context: Context): Icon =
    Icon.createWithResource(context, resolveSmallIcon(context))

  private fun notificationId(id: String): Int = id.hashCode()

  private fun requestCode(id: String, action: String): Int =
    String.format(Locale.US, "%s:%s", id, action).hashCode()

  private fun pendingIntentFlags(): Int =
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
}
