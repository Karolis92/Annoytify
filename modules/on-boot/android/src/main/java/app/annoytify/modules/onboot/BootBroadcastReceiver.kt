package app.annoytify.modules.onboot

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.HeadlessJsTaskService

class BootBroadcastReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val action = intent?.action

    if (!supportedActions.contains(action)) {
      Log.w(logTag, "Ignoring unsupported boot action: $action")
      return
    }

    try {
      HeadlessJsTaskService.acquireWakeLockNow(context.applicationContext)
      context.applicationContext.startService(
        Intent(context, BootTaskService::class.java).apply {
          setAction(action)
        }
      )
    } catch (error: RuntimeException) {
      Log.e(logTag, "Failed to start boot headless task for action=$action", error)
    }
  }

  companion object {
    const val logTag = "AnnoytifyBoot"
    val supportedActions = setOf(
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_MY_PACKAGE_REPLACED,
      "android.intent.action.QUICKBOOT_POWERON",
      "com.htc.intent.action.QUICKBOOT_POWERON"
    )
  }
}
