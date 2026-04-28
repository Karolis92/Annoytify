package app.annoytify.modules.notifications

import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.HeadlessJsTaskService
import org.json.JSONException

internal object NotificationEventDispatcher {
  fun dispatchFromIntent(context: Context, intent: Intent?): Boolean {
    if (intent == null) {
      Log.e(logTag, "Notification event intent is missing.")
      return false
    }

    val notificationJson = intent.getStringExtra(NotificationsConstants.extraNotificationJson)
    val eventType = intent.getStringExtra(NotificationsConstants.extraEventType)

    if (notificationJson.isNullOrEmpty() || eventType.isNullOrEmpty()) {
      Log.e(logTag, "Notification event intent is missing required extras.")
      return false
    }

    return dispatch(
      context = context,
      notificationJson = notificationJson,
      eventType = eventType,
      actionId = intent.getStringExtra(NotificationsConstants.extraActionId)
    )
  }

  fun dispatch(
    context: Context,
    notificationJson: String,
    eventType: String,
    actionId: String? = null
  ): Boolean {
    val eventJson = try {
      NotificationsJson.createEventJson(eventType, notificationJson, actionId)
    } catch (error: JSONException) {
      Log.e(logTag, "Failed to parse notification event payload.", error)
      return false
    }

    return try {
      HeadlessJsTaskService.acquireWakeLockNow(context.applicationContext)
      context.applicationContext.startService(
        Intent(context, NotificationEventTaskService::class.java).apply {
          putExtra(NotificationsConstants.extraEventJson, eventJson)
        }
      )
      true
    } catch (error: IllegalStateException) {
      Log.e(logTag, "Failed to start notification headless task.", error)
      false
    }
  }

  private const val logTag = "NotificationEvents"
}
