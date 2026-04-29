package app.annoytify.modules.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import kotlin.concurrent.thread

class NotificationsBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val action = intent?.action

    if (!supportedActions.contains(action)) {
      Log.w(NotificationsLogger.tag, "Ignoring unsupported notifications boot action: $action")
      return
    }

    val pendingResult = goAsync()
    thread(name = "AnnoytifyBootRestore") {
      try {
        NotificationsManager.restorePersistedNotifications(context.applicationContext)
      } catch (error: RuntimeException) {
        Log.e(
          NotificationsLogger.tag,
          "Failed to restore persisted notifications for action=$action",
          error
        )
      } finally {
        pendingResult.finish()
      }
    }
  }

  private companion object {
    val supportedActions = setOf(
      Intent.ACTION_LOCKED_BOOT_COMPLETED,
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_MY_PACKAGE_REPLACED,
      "android.intent.action.QUICKBOOT_POWERON",
      "com.htc.intent.action.QUICKBOOT_POWERON"
    )
  }
}
