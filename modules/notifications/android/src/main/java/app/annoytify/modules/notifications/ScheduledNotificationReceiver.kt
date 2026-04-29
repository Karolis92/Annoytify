package app.annoytify.modules.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import org.json.JSONException

class ScheduledNotificationReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != NotificationsConstants.actionScheduledNotification) {
      Log.w(NotificationsLogger.tag, "Ignoring unsupported scheduled notification action=${intent?.action}")
      return
    }

    val notificationJson = intent?.getStringExtra(NotificationsConstants.extraNotificationJson)

    if (notificationJson == null) {
      Log.e(NotificationsLogger.tag, "Scheduled notification intent is missing the payload.")
      return
    }

    try {
      NotificationsManager.displayNotification(
        context,
        NotificationsJson.parseNotification(notificationJson)
      )
    } catch (error: JSONException) {
      Log.e(NotificationsLogger.tag, "Failed to parse scheduled notification payload.", error)
    }
  }
}
