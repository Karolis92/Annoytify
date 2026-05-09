package expo.modules.onboot

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.HeadlessJsTaskService

class BootBroadcastReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "AnnoytifyBootReceiver"

        private val SUPPORTED_ACTIONS = setOf(
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            "android.intent.action.QUICKBOOT_POWERON",
            "com.htc.intent.action.QUICKBOOT_POWERON"
        )
    }

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action
        if (action !in SUPPORTED_ACTIONS) {
            Log.d(TAG, "Ignoring unsupported boot restore action: $action")
            return
        }

        val serviceIntent = Intent(context, BootTaskService::class.java)
        context.startService(serviceIntent)
        HeadlessJsTaskService.acquireWakeLockNow(context)
    }
}
