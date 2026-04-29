package app.annoytify.modules.notifications

internal enum class ReminderRestoreAction {
  Display,
  Schedule,
  WaitForExactAlarmPermission
}

internal object ReminderRestorePlanner {
  fun decide(
    triggerAtMillis: Long,
    nowMillis: Long,
    canScheduleExactAlarms: Boolean
  ): ReminderRestoreAction {
    if (triggerAtMillis <= nowMillis) {
      return ReminderRestoreAction.Display
    }

    return if (canScheduleExactAlarms) {
      ReminderRestoreAction.Schedule
    } else {
      ReminderRestoreAction.WaitForExactAlarmPermission
    }
  }
}
