package app.annoytify.modules.onboot

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.facebook.react.HeadlessJsTaskService

class BootBroadcastReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    HeadlessJsTaskService.acquireWakeLockNow(context.applicationContext)
    context.applicationContext.startService(
      Intent(context, BootTaskService::class.java)
    )
  }
}
