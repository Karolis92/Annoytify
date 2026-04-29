package app.annoytify.modules.onboot

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

// Runs after native boot restoration to reconcile SQLite task data with the native reminder store.
class BootTaskService : HeadlessJsTaskService() {
  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
    return HeadlessJsTaskConfig(
      "annoytify-onboot",
      Arguments.createMap().apply {
        putString("action", intent?.action)
      },
      60_000,
      true
    )
  }
}
