package expo.modules.notifications

import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

internal data class NotificationActionPayload(
  val id: String,
  val title: String
) {
  fun toJson(): JSONObject =
    JSONObject()
      .put("id", id)
      .put("title", title)
}

internal data class NotificationPayload(
  val id: String,
  val title: String,
  val body: String?,
  val channelId: String,
  val ongoing: Boolean,
  val autoCancel: Boolean,
  val actions: List<NotificationActionPayload>
) {
  fun putInto(intent: Intent): Intent {
    intent.putExtra(NotificationConstants.EXTRA_NOTIFICATION_ID, id)
    intent.putExtra(NotificationConstants.EXTRA_NOTIFICATION_TITLE, title)
    intent.putExtra(NotificationConstants.EXTRA_NOTIFICATION_BODY, body)
    intent.putExtra(NotificationConstants.EXTRA_NOTIFICATION_CHANNEL_ID, channelId)
    intent.putExtra(NotificationConstants.EXTRA_NOTIFICATION_ONGOING, ongoing)
    intent.putExtra(NotificationConstants.EXTRA_NOTIFICATION_AUTO_CANCEL, autoCancel)
    intent.putExtra(NotificationConstants.EXTRA_NOTIFICATION_ACTIONS, actionsToJson())
    return intent
  }

  fun toWritableMap(): WritableMap {
    val notification = Arguments.createMap()
    notification.putString("id", id)
    notification.putString("title", title)
    notification.putString("body", body)

    val android = Arguments.createMap()
    android.putString("channelId", channelId)
    android.putBoolean("ongoing", ongoing)
    android.putBoolean("autoCancel", autoCancel)

    val actionArray = Arguments.createArray()
    actions.forEach { action ->
      val actionMap = Arguments.createMap()
      actionMap.putString("id", action.id)
      actionMap.putString("title", action.title)
      actionArray.pushMap(actionMap)
    }
    android.putArray("actions", actionArray)

    notification.putMap("android", android)
    return notification
  }

  private fun actionsToJson(): String {
    val json = JSONArray()
    actions.forEach { json.put(it.toJson()) }
    return json.toString()
  }

  companion object {
    private const val TAG = "AnnoytifyNotificationPayload"

    fun fromRecord(record: NativeNotificationRecord): NotificationPayload =
      NotificationPayload(
        id = record.id,
        title = record.title,
        body = record.body,
        channelId = record.android.channelId,
        ongoing = record.android.ongoing,
        autoCancel = record.android.autoCancel,
        actions = record.android.actions.map {
          NotificationActionPayload(id = it.id, title = it.title)
        }
      )

    fun fromIntent(intent: Intent?): NotificationPayload? {
      if (intent == null) {
        return null
      }

      val id = intent.getStringExtra(NotificationConstants.EXTRA_NOTIFICATION_ID) ?: return null
      val title = intent.getStringExtra(NotificationConstants.EXTRA_NOTIFICATION_TITLE) ?: return null
      val channelId =
        intent.getStringExtra(NotificationConstants.EXTRA_NOTIFICATION_CHANNEL_ID) ?: return null

      return NotificationPayload(
        id = id,
        title = title,
        body = intent.getStringExtra(NotificationConstants.EXTRA_NOTIFICATION_BODY),
        channelId = channelId,
        ongoing = intent.getBooleanExtra(NotificationConstants.EXTRA_NOTIFICATION_ONGOING, false),
        autoCancel = intent.getBooleanExtra(
          NotificationConstants.EXTRA_NOTIFICATION_AUTO_CANCEL,
          false
        ),
        actions = actionsFromJson(
          intent.getStringExtra(NotificationConstants.EXTRA_NOTIFICATION_ACTIONS)
        )
      )
    }

    private fun actionsFromJson(value: String?): List<NotificationActionPayload> {
      if (value.isNullOrBlank()) {
        return emptyList()
      }

      return try {
        val actions = mutableListOf<NotificationActionPayload>()
        val json = JSONArray(value)
        for (index in 0 until json.length()) {
          val action = json.getJSONObject(index)
          actions.add(
            NotificationActionPayload(
              id = action.getString("id"),
              title = action.getString("title")
            )
          )
        }
        actions
      } catch (error: JSONException) {
        Log.w(TAG, "Failed to parse notification actions; using no actions instead", error)
        emptyList()
      }
    }
  }
}
