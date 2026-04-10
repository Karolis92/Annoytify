import { Plus } from "@tamagui/lucide-icons-2";
import { useState } from "react";
import { Button, ScrollView, View } from "tamagui";
import Sheet from "../common/components/Sheet";
import useTasks from "./hooks/useTasks";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";

interface SheetState {
  open: boolean;
  taskId?: string;
}

const TasksScreen = () => {
  const taskRows = useTasks();
  const [sheetState, setSheetState] = useState<SheetState>({ open: false });

  return (
    <View padding="$3" flex={1}>
      <ScrollView>
        <View mb="$12" gap="$4">
          {taskRows.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => setSheetState({ open: true, taskId: task.id })}
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
      >
        <TaskForm
          taskId={sheetState.taskId}
          onClose={() => setSheetState({ open: false })}
        />
      </Sheet>
    </View>
  );
};
export default TasksScreen;
