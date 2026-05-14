package expo.modules.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class NotificationAlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != NotificationConstants.ACTION_ALARM) {
      Log.d(TAG, "Ignoring unsupported alarm action: ${intent?.action}")
      return
    }

    val payload = NotificationPayload.fromIntent(intent)
    if (payload == null) {
      Log.w(TAG, "Ignoring alarm without notification payload")
      return
    }

    NotificationHelper.display(context, payload)
  }

  companion object {
    private const val TAG = "AnnoytifyAlarmReceiver"
  }
}
