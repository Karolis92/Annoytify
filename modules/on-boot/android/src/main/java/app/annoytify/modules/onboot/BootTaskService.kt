package app.annoytify.modules.onboot

import android.content.Intent
import android.util.Log
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class BootTaskService : HeadlessJsTaskService() {
  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
    val action = intent?.action

    if (!BootBroadcastReceiver.supportedActions.contains(action)) {
      Log.w(BootLogger.tag, "Ignoring unsupported boot task action: $action")
      return null
    }

    return HeadlessJsTaskConfig(
      "annoytify-onboot",
      Arguments.createMap().apply {
        putString("action", action)
      },
      60_000,
      true
    )
  }
}
