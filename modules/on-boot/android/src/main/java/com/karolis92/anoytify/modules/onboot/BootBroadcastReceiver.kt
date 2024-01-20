package app.annoytify.modules.onboot

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import app.annoytify.modules.onboot.BootTaskService

class BootBroadcastReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val serviceIntent = Intent(context, BootTaskService::class.java)
        context.startService(serviceIntent)
        HeadlessJsTaskService.acquireWakeLockNow(context)
    }
}
