package app.annoytify.modules.notifications

import org.junit.Assert.assertEquals
import org.junit.Test

class ReminderRestorePlannerTest {
  @Test
  fun `returns display for due reminders`() {
    assertEquals(
      ReminderRestoreAction.Display,
      ReminderRestorePlanner.decide(
        triggerAtMillis = 100,
        nowMillis = 100,
        canScheduleExactAlarms = false
      )
    )
  }

  @Test
  fun `returns schedule for future reminders when exact alarms are allowed`() {
    assertEquals(
      ReminderRestoreAction.Schedule,
      ReminderRestorePlanner.decide(
        triggerAtMillis = 200,
        nowMillis = 100,
        canScheduleExactAlarms = true
      )
    )
  }

  @Test
  fun `returns wait for permission for future reminders when exact alarms are blocked`() {
    assertEquals(
      ReminderRestoreAction.WaitForExactAlarmPermission,
      ReminderRestorePlanner.decide(
        triggerAtMillis = 200,
        nowMillis = 100,
        canScheduleExactAlarms = false
      )
    )
  }
}
