package expo.modules.notifications

internal object NotificationConstants {
  const val CHANNEL_NAME = "Reminders"
  const val HEADLESS_TASK_NAME = "annoytify-notification-event"

  const val ACTION_ALARM = "app.annoytify.notifications.ALARM"
  const val ACTION_DISMISSED = "app.annoytify.notifications.DISMISSED"
  const val ACTION_ACTION_PRESS = "app.annoytify.notifications.ACTION_PRESS"
  const val EVENT_DISMISSED = "dismissed"
  const val EVENT_ACTION_PRESS = "actionPress"

  const val EXTRA_EVENT_TYPE = "eventType"
  const val EXTRA_PRESS_ACTION_ID = "pressActionId"
  const val EXTRA_NOTIFICATION_ID = "notificationId"
  const val EXTRA_NOTIFICATION_TITLE = "notificationTitle"
  const val EXTRA_NOTIFICATION_BODY = "notificationBody"
  const val EXTRA_NOTIFICATION_CHANNEL_ID = "notificationChannelId"
  const val EXTRA_NOTIFICATION_ONGOING = "notificationOngoing"
  const val EXTRA_NOTIFICATION_AUTO_CANCEL = "notificationAutoCancel"
  const val EXTRA_NOTIFICATION_ACTIONS = "notificationActions"
}
