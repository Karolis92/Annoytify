package app.annoytify.modules.notifications

import org.json.JSONArray
import org.json.JSONObject

internal object NotificationsJson {
  fun parseNotification(notificationJson: String): NotificationRequestRecord =
    parseNotification(JSONObject(notificationJson))

  fun serializeNotification(notification: NotificationRequestRecord): String {
    return notification.toJson().toString()
  }

  fun createEventJson(
    eventType: String,
    notificationJson: String,
    actionId: String?
  ): String {
    return createEventJson(eventType, parseNotification(notificationJson), actionId)
  }

  private fun createEventJson(
    eventType: String,
    notification: NotificationRequestRecord,
    actionId: String?
  ): String {
    return JSONObject()
      .put("type", eventType)
      .put("notification", notification.toJson())
      .putIfNotNull("actionId", actionId)
      .toString()
  }

  private fun parseNotification(notification: JSONObject): NotificationRequestRecord {
    return NotificationRequestRecord(
      id = notification.getString("id"),
      title = notification.getString("title"),
      body = notification.optStringOrNull("body"),
      channelId = notification.getString("channelId"),
      ongoing = notification.optBoolean("ongoing", false),
      autoCancel = notification.optBoolean("autoCancel", true),
      actions = notification.optJSONArray("actions")?.let(::parseActions).orEmpty()
    )
  }

  private fun parseActions(actions: JSONArray): List<NotificationActionRecord> {
    return List(actions.length()) { index ->
      val action = actions.getJSONObject(index)
      NotificationActionRecord(
        id = action.getString("id"),
        title = action.getString("title")
      )
    }
  }
}

private fun NotificationRequestRecord.toJson(): JSONObject {
  return JSONObject()
    .put("id", id)
    .put("title", title)
    .putIfNotNull("body", body)
    .put("channelId", channelId)
    .put("ongoing", ongoing)
    .put("autoCancel", autoCancel)
    .put(
      "actions",
      JSONArray().apply {
        actions.forEach { action ->
          put(
            action.toJson()
          )
        }
      }
    )
}

private fun NotificationActionRecord.toJson(): JSONObject {
  return JSONObject()
    .put("id", id)
    .put("title", title)
}

private fun JSONObject.optStringOrNull(key: String): String? {
  return if (has(key) && !isNull(key)) {
    getString(key)
  } else {
    null
  }
}

private fun JSONObject.putIfNotNull(key: String, value: Any?): JSONObject {
  if (value != null) {
    put(key, value)
  }

  return this
}
