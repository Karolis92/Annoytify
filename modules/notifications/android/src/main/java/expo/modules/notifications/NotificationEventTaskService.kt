package expo.modules.notifications

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class NotificationEventTaskService : HeadlessJsTaskService() {
  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig {
    val event = Arguments.createMap()
    event.putString(
      "type",
      intent?.getStringExtra(NotificationConstants.EXTRA_EVENT_TYPE)
        ?: NotificationConstants.EVENT_DISMISSED
    )

    val payload = NotificationPayload.fromIntent(intent)
    if (payload != null) {
      event.putMap("notification", payload.toWritableMap())
    }

    val pressActionId = intent?.getStringExtra(NotificationConstants.EXTRA_PRESS_ACTION_ID)
    if (pressActionId != null) {
      val pressAction = Arguments.createMap()
      pressAction.putString("id", pressActionId)
      event.putMap("pressAction", pressAction)
    }

    return HeadlessJsTaskConfig(
      NotificationConstants.HEADLESS_TASK_NAME,
      event,
      60_000,
      true
    )
  }
}
