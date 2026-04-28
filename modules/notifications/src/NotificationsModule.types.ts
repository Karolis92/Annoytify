export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
}

export interface NotificationAction {
  id: string;
  title: string;
}

export interface NotificationRequest {
  id: string;
  title: string;
  body?: string;
  channelId: string;
  ongoing?: boolean;
  autoCancel?: boolean;
  actions?: NotificationAction[];
}

export enum NotificationEventType {
  Dismissed = "dismissed",
  Pressed = "pressed",
  ActionPressed = "actionPressed",
}

export interface NotificationEvent {
  type: NotificationEventType;
  notification: NotificationRequest;
  actionId?: string;
}
