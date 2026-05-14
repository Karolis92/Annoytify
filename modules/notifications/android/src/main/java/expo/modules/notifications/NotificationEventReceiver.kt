package expo.modules.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class NotificationEventReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val action = intent?.action
    if (action !in SUPPORTED_ACTIONS) {
      Log.d(TAG, "Ignoring unsupported notification event action: $action")
      return
    }

    NotificationHelper.startEventTask(context, intent)
  }

  companion object {
    private const val TAG = "AnnoytifyEventReceiver"

    private val SUPPORTED_ACTIONS = setOf(
      NotificationConstants.ACTION_DISMISSED,
      NotificationConstants.ACTION_ACTION_PRESS
    )
  }
}
