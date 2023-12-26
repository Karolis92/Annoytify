import notifee, { EventType } from '@notifee/react-native';
import { Button, StyleSheet, View } from 'react-native';

export default function App() {
  async function displayNotification() {
    await notifee.requestPermission()
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    await notifee.displayNotification({
      id: "notification1",
      title: 'Title',
      body: 'Content',
      android: {
        channelId,
        ongoing: true,
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      },
    });

    const unsub = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification?.id);
          unsub()
          break;
      }
    })
  }

  return (
    <View style={styles.container}>
      <Button title="Display Notification" onPress={() => displayNotification()} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
