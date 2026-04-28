package app.annoytify.modules.notifications

internal object NotificationsConstants {
  const val extraActionId = "actionId"
  const val extraEventJson = "eventJson"
  const val extraEventType = "eventType"
  const val extraNotificationJson = "notificationJson"
  const val headlessTaskName = "annoytify-notification-event"
  const val notificationEventTaskTimeoutMs = 30_000
  const val notificationEventWorkName = "annoytify-notification-event"

  const val eventDismissed = "dismissed"
  const val eventPressed = "pressed"
  const val eventActionPressed = "actionPressed"
}
