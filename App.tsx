import { Button, StyleSheet, View } from "react-native";
import { registerOnBootTask } from "./modules/on-boot";
import { NotificationChannels } from "./src/enum/NotificationChannels";
import { PressAction } from "./src/enum/PressAction";
import { useNotificationEventListener } from "./src/hooks/useNotificationEventListener";
import { notificationService } from "./src/services/notificationService";

registerOnBootTask(async () => showTestNotification());

export default function App() {
  useNotificationEventListener();

  async function showNotification() {
    await notificationService.requestPermission();
    showTestNotification();
  }

  return (
    <View style={styles.container}>
      <Button title="Display Notification" onPress={() => showNotification()} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

const showTestNotification = () => {
  notificationService.displayNotification({
    id: "notification1",
    title: "Title",
    body: "Content",
    android: {
      channelId: NotificationChannels.Reminders,
      ongoing: true,
      autoCancel: false,
      pressAction: { id: PressAction.Default },
      actions: [
        {
          title: "Done",
          pressAction: {
            id: PressAction.Done,
          },
        },
      ],
    },
  });
};
