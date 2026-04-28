package app.annoytify.modules.notifications

import android.Manifest
import android.content.Intent
import android.os.Build
import expo.modules.interfaces.permissions.Permissions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NotificationsModule")

    OnActivityEntersForeground {
      appContext?.currentActivity?.intent?.let(::handleNotificationIntent)
    }

    OnNewIntent { intent ->
      handleNotificationIntent(intent)
    }

    AsyncFunction("setNotificationChannelsAsync") { channels: List<NotificationChannelRecord> ->
      val reactContext = requireNotNull(appContext?.reactContext) {
        "React context is not available"
      }

      NotificationsManager.setNotificationChannels(reactContext, channels)
    }

    AsyncFunction("requestPermissionAsync") { promise: Promise ->
      val reactContext = requireNotNull(appContext?.reactContext) {
        "React context is not available"
      }

      if (NotificationsManager.areNotificationsEnabled(reactContext)) {
        promise.resolve(true)
        return@AsyncFunction
      }

      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
        promise.resolve(false)
        return@AsyncFunction
      }

      if (appContext?.currentActivity == null) {
        promise.resolve(false)
        return@AsyncFunction
      }

      val permissions = appContext?.legacyModule<Permissions>()
      Permissions.askForPermissionsWithPermissionsManager(
        permissions,
        object : Promise {
          override fun resolve(value: Any?) {
            promise.resolve(NotificationsManager.areNotificationsEnabled(reactContext))
          }

          override fun reject(code: String, message: String?, cause: Throwable?) {
            promise.reject(code, message, cause)
          }
        },
        Manifest.permission.POST_NOTIFICATIONS
      )
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("getPermissionStatusAsync") {
      val reactContext = requireNotNull(appContext?.reactContext) {
        "React context is not available"
      }

      return@AsyncFunction NotificationsManager.areNotificationsEnabled(reactContext)
    }

    AsyncFunction("requestExactAlarmPermissionAsync") {
      val reactContext = requireNotNull(appContext?.reactContext) {
        "React context is not available"
      }

      return@AsyncFunction NotificationsManager.requestExactAlarmPermission(reactContext)
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("getExactAlarmPermissionStatusAsync") {
      val reactContext = requireNotNull(appContext?.reactContext) {
        "React context is not available"
      }

      return@AsyncFunction NotificationsManager.canScheduleExactAlarms(reactContext)
    }

    AsyncFunction("displayNotificationAsync") { notification: NotificationRequestRecord ->
      val reactContext = requireNotNull(appContext?.reactContext) {
        "React context is not available"
      }

      NotificationsManager.displayNotification(reactContext, notification)
    }

    AsyncFunction("scheduleNotificationAsync") { notification: NotificationRequestRecord, timestamp: Double ->
      val reactContext = requireNotNull(appContext?.reactContext) {
        "React context is not available"
      }

      NotificationsManager.scheduleNotification(
        reactContext,
        notification,
        timestamp.toLong()
      )
    }

    AsyncFunction("cancelNotificationAsync") { id: String ->
      val reactContext = requireNotNull(appContext?.reactContext) {
        "React context is not available"
      }

      NotificationsManager.cancelNotification(reactContext, id)
    }
  }

  private fun handleNotificationIntent(intent: Intent) {
    val eventType = intent.getStringExtra(NotificationsConstants.extraEventType)

    if (
      eventType != NotificationsConstants.eventPressed ||
      !intent.hasExtra(NotificationsConstants.extraNotificationJson)
    ) {
      return
    }

    val reactContext = appContext?.reactContext ?: return
    NotificationEventDispatcher.dispatchFromIntent(reactContext, intent)

    intent.removeExtra(NotificationsConstants.extraNotificationJson)
    intent.removeExtra(NotificationsConstants.extraEventType)
    intent.removeExtra(NotificationsConstants.extraActionId)
  }
}
