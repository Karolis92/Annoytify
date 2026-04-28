package app.annoytify.modules.notifications

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class NotificationEventTaskService : HeadlessJsTaskService() {
  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
    val eventJson = intent?.getStringExtra(NotificationsConstants.extraEventJson)
      ?: return null

    return HeadlessJsTaskConfig(
      NotificationsConstants.headlessTaskName,
      Arguments.createMap().apply {
        putString(NotificationsConstants.extraEventJson, eventJson)
      },
      NotificationsConstants.notificationEventTaskTimeoutMs.toLong(),
      true
    )
  }
}
