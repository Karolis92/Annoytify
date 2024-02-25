import { useState } from "react";
import { Button, Sheet, Text, View } from "tamagui";

const TasksScreen = () => {
  const [open, setOpen] = useState(false);
  return (
    <View padding="$3" gap="$3">
      <Button onPress={() => setOpen(true)}>open</Button>
      <Sheet open={open} onOpenChange={setOpen} dismissOnSnapToBottom modal>
        <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Handle />
        <Sheet.Frame
          padding="$4"
          justifyContent="center"
          alignItems="center"
          gap="$5"
        >
          <Text>TEST</Text>
        </Sheet.Frame>
      </Sheet>
    </View>
  );
};
export default TasksScreen;
