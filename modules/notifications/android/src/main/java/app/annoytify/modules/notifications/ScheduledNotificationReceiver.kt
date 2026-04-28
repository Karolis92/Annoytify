package app.annoytify.modules.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import org.json.JSONException

class ScheduledNotificationReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val notificationJson = intent?.getStringExtra(NotificationsConstants.extraNotificationJson)

    if (notificationJson == null) {
      Log.e(logTag, "Scheduled notification intent is missing the payload.")
      return
    }

    try {
      NotificationsManager.displayNotification(
        context,
        NotificationsJson.parseNotification(notificationJson)
      )
    } catch (error: JSONException) {
      Log.e(logTag, "Failed to parse scheduled notification payload.", error)
    }
  }

  private companion object {
    const val logTag = "ScheduledNotification"
  }
}
