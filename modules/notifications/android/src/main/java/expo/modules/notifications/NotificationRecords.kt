package expo.modules.notifications

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

internal data class NotificationActionRecord(
  @Field val id: String,
  @Field val title: String
) : Record

internal data class AndroidNotificationRecord(
  @Field val channelId: String,
  @Field val ongoing: Boolean = false,
  @Field val autoCancel: Boolean = false,
  @Field val actions: List<NotificationActionRecord> = emptyList()
) : Record

internal data class NativeNotificationRecord(
  @Field val id: String,
  @Field val title: String,
  @Field val body: String? = null,
  @Field val android: AndroidNotificationRecord
) : Record
