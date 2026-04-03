import { Save, Trash2, X } from "@tamagui/lucide-icons";
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
import { createTaskId, ITask } from "./db/models";
import tasksRepository from "./db/tasksRepository";
import tasksService from "./services/tasksService";

interface TaskFormProps {
  taskId?: string;
  onClose: () => void;
  onSaved: () => void;
}

const createDefaultState = (): ITask => ({
  _id: createTaskId(),
  title: "",
  description: "",
  date: new Date(),
  repeat: Repeat.No,
  done: false,
});

const TaskForm = ({ taskId, onClose, onSaved }: TaskFormProps) => {
  const [titleError, setTitleError] = useState<string>();
  const [existingTask, setExistingTask] = useState<ITask>();
  const [formState, setFormState] = useState<ITask>(createDefaultState);

  useEffect(() => {
    let mounted = true;
    const loadTask = async () => {
      if (!taskId) {
        setExistingTask(undefined);
        setFormState(createDefaultState());
        return;
      }
      const task = await tasksRepository.get(taskId);
      if (!mounted) {
        return;
      }
      if (task) {
        setExistingTask(task);
        setFormState(task);
      } else {
        setExistingTask(undefined);
        setFormState(createDefaultState());
      }
    };

    loadTask();

    return () => {
      mounted = false;
    };
  }, [taskId]);

  const changeHandler =
    (field: keyof ITask) =>
    <T,>(value: T) => {
      setFormState({ ...formState, [field]: value });
      if (field === "title" && typeof value === "string" && value.trim()) {
        setTitleError(undefined);
      }
    };

  const onSubmit = async () => {
    if (!formState.title.trim()) {
      setTitleError("Title is required");
      return;
    }
    await tasksService.createOrUpdate(formState);
    onSaved();
    onClose();
    ToastAndroid.show(
      existingTask ? "Task updated!" : "Task created!",
      ToastAndroid.SHORT,
    );
  };

  const onDelete = async () => {
    if (existingTask) {
      await tasksService.delete(existingTask);
      onSaved();
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
            icon={Trash2}
            variant="outlined"
            borderColor="$red4"
            color="$red10"
            onPress={onDelete}
          >
            Delete
          </Button>
        )}
      </View>
    </Form>
  );
};

export default TaskForm;
