import { Plus } from "@tamagui/lucide-icons";
import { useEffect, useState } from "react";
import { ToastAndroid } from "react-native";
import { Button, ScrollView, View } from "tamagui";
import Sheet from "../common/components/Sheet";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import { useLiveTasks } from "./useLiveTasks";

interface SheetState {
  open: boolean;
  taskId?: string;
}

const TasksScreen = () => {
  const { tasks, error, refresh } = useLiveTasks();
  const [sheetState, setSheetState] = useState<SheetState>({ open: false });

  useEffect(() => {
    if (error) {
      ToastAndroid.show("Failed to load tasks.", ToastAndroid.SHORT);
    }
  }, [error]);

  return (
    <View padding="$3" flex={1}>
      <ScrollView>
        <View mb="$12" gap="$4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => setSheetState({ open: true, taskId: task.id })}
              onDoneChanged={refresh}
            />
          ))}
        </View>
      </ScrollView>
      <Button
        onPress={() => setSheetState({ open: true })}
        icon={Plus}
        circular
        size="$6"
        scaleIcon={2}
        position="absolute"
        bottom="$4"
        right="$4"
      />

      <Sheet
        open={sheetState.open}
        onOpenChange={(open: boolean) => setSheetState({ ...sheetState, open })}
        snapPointsMode="percent"
        snapPoints={[95]}
      >
        <TaskForm
          taskId={sheetState.taskId}
          onClose={() => setSheetState({ open: false })}
          onSaved={refresh}
        />
      </Sheet>
    </View>
  );
};
export default TasksScreen;
