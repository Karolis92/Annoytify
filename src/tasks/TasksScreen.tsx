import { Plus } from "@tamagui/lucide-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Button, ScrollView, View } from "tamagui";
import Sheet from "../common/components/Sheet";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import { Task } from "./db/models";
import tasksRepository from "./db/tasksRepository";

interface SheetState {
  open: boolean;
  taskId?: string;
}

const TasksScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sheetState, setSheetState] = useState<SheetState>({ open: false });

  const refreshTasks = useCallback(async () => {
    setTasks(await tasksRepository.getAll());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshTasks();
    }, [refreshTasks]),
  );

  return (
    <View padding="$3" flex={1}>
      <ScrollView>
        <View mb="$12" gap="$4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onPress={() => setSheetState({ open: true, taskId: task._id })}
              onDoneChanged={refreshTasks}
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
          onSaved={refreshTasks}
        />
      </Sheet>
    </View>
  );
};
export default TasksScreen;
