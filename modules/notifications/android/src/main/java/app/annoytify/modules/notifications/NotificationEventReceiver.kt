package app.annoytify.modules.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class NotificationEventReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    NotificationEventDispatcher.dispatchFromIntent(context, intent)
  }
}
