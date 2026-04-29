package app.annoytify.modules.notifications

import android.content.Context
import android.os.Build
import android.util.Log
import org.json.JSONObject
import java.util.concurrent.atomic.AtomicBoolean

internal enum class PersistedReminderState(val value: String) {
  Scheduled("scheduled"),
  Displayed("displayed"),
  Blocked("blocked");

  companion object {
    fun from(value: String?): PersistedReminderState {
      return values().firstOrNull { it.value == value } ?: run {
        Log.w(
          NotificationsLogger.tag,
          "Unknown persisted reminder state '$value', defaulting to scheduled."
        )
        Scheduled
      }
    }
  }
}

internal data class PersistedReminderRecord(
  val notification: NotificationRequestRecord,
  val triggerAtMillis: Long,
  val state: PersistedReminderState
)

internal object NotificationsStorage {
  private const val preferencesName = "annoytify-notifications"
  private const val channelsKey = "channels"
  private const val remindersKey = "reminders"
  private val migrationAttempted = AtomicBoolean(false)

  fun setChannels(context: Context, channels: List<NotificationChannelRecord>) {
    val storedChannels = JSONObject().apply {
      channels.forEach { channel ->
        put(channel.id, channel.toJson())
      }
    }

    preferences(context)
      .edit()
      .putString(channelsKey, storedChannels.toString())
      .apply()
  }

  fun getChannels(context: Context): List<NotificationChannelRecord> {
    val storedChannels = preferences(context).getString(channelsKey, null) ?: return emptyList()
    val channelsJson = JSONObject(storedChannels)

    return channelsJson.keys().asSequence().map { key ->
      val channel = channelsJson.getJSONObject(key)
      NotificationChannelRecord(
        id = channel.getString("id"),
        name = channel.getString("name"),
        description = channel.optStringOrNull("description")
      )
    }.toList()
  }

  fun upsertReminder(context: Context, reminder: PersistedReminderRecord) {
    val reminders = getRemindersJson(context)
    reminders.put(reminder.notification.id, reminder.toJson())
    preferences(context)
      .edit()
      .putString(remindersKey, reminders.toString())
      .apply()
  }

  fun removeReminder(context: Context, id: String) {
    val reminders = getRemindersJson(context)
    reminders.remove(id)
    preferences(context)
      .edit()
      .putString(remindersKey, reminders.toString())
      .apply()
  }

  fun getReminder(context: Context, id: String): PersistedReminderRecord? {
    val reminders = getRemindersJson(context)

    return if (reminders.has(id)) {
      reminders.getJSONObject(id).toReminderRecord()
    } else {
      null
    }
  }

  fun getReminders(context: Context): List<PersistedReminderRecord> {
    val reminders = getRemindersJson(context)

    return reminders.keys().asSequence().map { key ->
      reminders.getJSONObject(key).toReminderRecord()
    }.toList()
  }

  private fun getRemindersJson(context: Context): JSONObject {
    val storedReminders = preferences(context).getString(remindersKey, null)
    return if (storedReminders.isNullOrEmpty()) {
      JSONObject()
    } else {
      JSONObject(storedReminders)
    }
  }

  private fun preferences(context: Context) = storageContext(context)
    .getSharedPreferences(preferencesName, Context.MODE_PRIVATE)

  // Use device-protected storage so reminder state is available during LOCKED_BOOT_COMPLETED
  // before the user unlocks the device, and migrate any existing credential-protected data once.
  private fun storageContext(context: Context): Context {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
      return context.applicationContext
    }

    val appContext = context.applicationContext
    val deviceContext = appContext.createDeviceProtectedStorageContext() ?: appContext
    if (
      migrationAttempted.compareAndSet(false, true) &&
      !deviceContext.moveSharedPreferencesFrom(appContext, preferencesName)
    ) {
      // Fresh installs legitimately return false here because there is no credential-protected
      // preferences file to migrate yet.
      Log.w(
        NotificationsLogger.tag,
        "Shared preferences migration to device-protected storage did not complete."
      )
    }

    return deviceContext
  }
}

private fun NotificationChannelRecord.toJson(): JSONObject {
  return JSONObject()
    .put("id", id)
    .put("name", name)
    .putIfNotNull("description", description)
}

private fun PersistedReminderRecord.toJson(): JSONObject {
  return JSONObject()
    .put("notification", JSONObject(NotificationsJson.serializeNotification(notification)))
    .put("triggerAtMillis", triggerAtMillis)
    .put("state", state.value)
}

private fun JSONObject.toReminderRecord(): PersistedReminderRecord {
  return PersistedReminderRecord(
    notification = NotificationsJson.parseNotification(getJSONObject("notification")),
    triggerAtMillis = getLong("triggerAtMillis"),
    state = PersistedReminderState.from(optString("state"))
  )
}
