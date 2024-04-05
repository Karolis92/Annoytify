import { useQuery } from "@realm/react";
import { Plus } from "@tamagui/lucide-icons";
import { useState } from "react";
import { BSON } from "realm";
import { Button, ScrollView, View } from "tamagui";
import Sheet from "../common/components/Sheet";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import { Task } from "./db/models";

interface SheetState {
  open: boolean;
  taskId?: BSON.ObjectId;
}

const TasksScreen = () => {
  const tasks = useQuery(Task);
  const [sheetState, setSheetState] = useState<SheetState>({ open: false });

  return (
    <View padding="$3" flex={1}>
      <ScrollView>
        <View mb="$12" gap="$4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id.toString()}
              task={task}
              onPress={() => setSheetState({ open: true, taskId: task._id })}
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
