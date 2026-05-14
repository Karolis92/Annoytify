package expo.modules.notifications

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Notifications")

    AsyncFunction("canScheduleExactAlarms") {
      NotificationHelper.canScheduleExactAlarms(requireNotNull(appContext.reactContext))
    }

    AsyncFunction("openExactAlarmSettings") {
      NotificationHelper.openExactAlarmSettings(requireNotNull(appContext.reactContext))
    }

    AsyncFunction("displayNotification") { notification: NativeNotificationRecord ->
      NotificationHelper.display(
        requireNotNull(appContext.reactContext),
        NotificationPayload.fromRecord(notification)
      )
    }

    AsyncFunction("scheduleNotification") { notification: NativeNotificationRecord, timestamp: Double ->
      NotificationHelper.schedule(
        requireNotNull(appContext.reactContext),
        NotificationPayload.fromRecord(notification),
        timestamp.toLong()
      )
    }

    AsyncFunction("cancelNotification") { id: String ->
      NotificationHelper.cancel(requireNotNull(appContext.reactContext), id)
    }
  }
}
