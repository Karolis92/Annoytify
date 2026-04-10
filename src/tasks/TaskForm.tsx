import { Save, Trash2, X } from "@tamagui/lucide-icons-2";
import { useEffect, useState } from "react";
import { ToastAndroid } from "react-native";
import {
  Button,
  Form,
  Input,
  Label,
  ScrollView,
  Text,
  TextArea,
  View,
} from "tamagui";
import DateSelect from "../common/components/DateSelect";
import Select from "../common/components/Select";
import { Repeat } from "../common/enums/Repeat";
import useTask from "./hooks/useTask";
import { getTasksService } from "./services/tasksService";

interface TaskFormProps {
  taskId?: string;
  onClose: () => void;
}

const TaskForm = ({ taskId, onClose }: TaskFormProps) => {
  const [titleError, setTitleError] = useState<string>();
  const existingTask = useTask(taskId);
  const [formState, setFormState] = useState(() => ({
    title: existingTask?.title ?? "",
    description: existingTask?.description ?? "",
    date: existingTask?.date ?? new Date(),
    repeat: existingTask?.repeat ?? Repeat.No,
    done: existingTask?.done ?? false,
  }));

  useEffect(() => {
    if (existingTask) {
      setFormState({
        title: existingTask.title,
        description: existingTask.description,
        date: existingTask.date,
        repeat: existingTask.repeat,
        done: existingTask.done,
      });
    }
  }, [existingTask]);

  const changeHandler =
    (field: string) =>
    <T,>(value: T) => {
      setFormState({ ...formState, [field]: value });
    };

  const onSubmit = async () => {
    if (!formState.title) {
      setTitleError("Title is required");
      return;
    }
    const tasksService = await getTasksService();
    if (existingTask) {
      await tasksService.update({
        ...existingTask,
        ...formState,
      });
    } else {
      await tasksService.create(formState);
    }
    onClose();
    ToastAndroid.show(
      existingTask ? "Task updated!" : "Task created!",
      ToastAndroid.SHORT,
    );
  };

  const onDelete = async () => {
    if (existingTask) {
      const tasksService = await getTasksService();
      await tasksService.delete(existingTask.id);
      onClose();
      ToastAndroid.show("Task deleted!", ToastAndroid.SHORT);
    }
  };

  return (
    <Form gap="$2" p="$3" flex={1} onSubmit={onSubmit}>
      <ScrollView>
        <View>
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            borderColor={titleError ? "$red9" : undefined}
            value={formState.title}
            onChangeText={changeHandler("title")}
          />
          {titleError && (
            <Text color="$red9" mt="$2">
              {titleError}
            </Text>
          )}
        </View>
        <View>
          <Label htmlFor="task-description">Description</Label>
          <TextArea
            id="task-description"
            textAlignVertical="top"
            value={formState.description}
            onChangeText={changeHandler("description")}
          />
        </View>
        <View>
          <Label htmlFor="task-date">Date</Label>
          <DateSelect
            id="task-date"
            value={formState.date}
            minimumDate={new Date()}
            onChange={changeHandler("date")}
          />
        </View>
        <View>
          <Label htmlFor="task-repeat">Repeat</Label>
          <Select
            id="task-repeat"
            value={formState.repeat}
            items={[
              { value: Repeat.No, text: "No" },
              { value: Repeat.Daily, text: "Daily" },
              { value: Repeat.Monthly, text: "Monthly" },
            ]}
            onValueChange={changeHandler("repeat")}
          />
        </View>
      </ScrollView>
      <View mt="$3" gap="$2">
        <Form.Trigger asChild>
          <Button icon={Save}>Save</Button>
        </Form.Trigger>
        <Button icon={X} variant="outlined" onPress={onClose}>
          Close
        </Button>
        {existingTask && (
          <Button
            icon={<Trash2 color="$red10" />}
            variant="outlined"
            borderColor="$red7"
            onPress={onDelete}
          >
            <Button.Text color="$red10">Delete</Button.Text>
          </Button>
        )}
      </View>
    </Form>
  );
};

export default TaskForm;
