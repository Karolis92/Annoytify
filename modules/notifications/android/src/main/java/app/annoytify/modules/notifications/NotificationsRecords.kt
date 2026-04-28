package app.annoytify.modules.notifications

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

internal data class NotificationChannelRecord(
  @Field
  val id: String,
  @Field
  val name: String,
  @Field
  val description: String? = null
) : Record

internal data class NotificationActionRecord(
  @Field
  val id: String,
  @Field
  val title: String
) : Record

internal data class NotificationRequestRecord(
  @Field
  val id: String,
  @Field
  val title: String,
  @Field
  val body: String? = null,
  @Field
  val channelId: String,
  @Field
  val ongoing: Boolean = false,
  @Field
  val autoCancel: Boolean = true,
  @Field
  val actions: List<NotificationActionRecord> = emptyList()
) : Record
