package app.annoytify.modules.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class NotificationEventReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != NotificationsConstants.actionNotificationEvent) {
      Log.w(NotificationsLogger.tag, "Ignoring unsupported notification event action=${intent?.action}")
      return
    }

    val notificationJson = intent.getStringExtra(NotificationsConstants.extraNotificationJson)
    val eventType = intent.getStringExtra(NotificationsConstants.extraEventType)

    if (notificationJson.isNullOrEmpty() || eventType.isNullOrEmpty()) {
      Log.e(NotificationsLogger.tag, "Notification event is missing required extras.")
      return
    }

    runCatching {
      NotificationsManager.handleNotificationEvent(
        context,
        NotificationsJson.parseNotification(notificationJson),
        eventType
      )
    }.onFailure { error ->
      Log.e(NotificationsLogger.tag, "Failed to handle native notification event.", error)
    }

    NotificationEventDispatcher.dispatchFromIntent(context, intent)
  }
}
