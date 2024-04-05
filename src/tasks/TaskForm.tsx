import { useQuery, useRealm } from "@realm/react";
import { Save, Trash2, X } from "@tamagui/lucide-icons";
import { useState } from "react";
import { ToastAndroid } from "react-native";
import { BSON, UpdateMode } from "realm";
import { Button, Form, Input, Label, TextArea, View } from "tamagui";
import DateSelect from "../common/components/DateSelect";
import Select from "../common/components/Select";
import { Repeat } from "../common/enums/Repeat";
import { ITask, Task } from "./db/models";

interface TaskForm {
  taskId?: BSON.ObjectId;
  onClose: () => void;
}

const TaskForm = ({ taskId, onClose }: TaskForm) => {
  const realm = useRealm();
  const [existingTask] = useQuery(
    Task,
    (tasks) => tasks.filtered("_id == $0", taskId),
    [taskId]
  );

  const [formState, setFormState] = useState<ITask>(() => ({
    _id: existingTask?._id ?? new BSON.ObjectId(),
    title: existingTask?.title ?? "",
    description: existingTask?.description ?? "",
    date: existingTask?.date ?? new Date(),
    repeat: existingTask?.repeat ?? Repeat.Once,
    done: false,
  }));

  const changeHandler =
    (field: string) =>
    <T,>(value: T) => {
      setFormState({ ...formState, [field]: value });
    };

  const onSubmit = () => {
    realm.write(() => realm.create(Task, formState, UpdateMode.Modified));
    onClose();
    ToastAndroid.show(
      existingTask ? "Task updated!" : "Task created!",
      ToastAndroid.SHORT
    );
  };

  const onDelete = () => {
    realm.write(() => realm.delete(existingTask));
    onClose();
    ToastAndroid.show("Task deleted!", ToastAndroid.SHORT);
  };

  return (
    <Form gap="$2" p="$3" onSubmit={onSubmit}>
      <View>
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          value={formState.title}
          onChangeText={changeHandler("title")}
        />
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
            { value: Repeat.Once, text: "Once" },
            { value: Repeat.Daily, text: "Daily" },
            { value: Repeat.Monthly, text: "Monthly" },
          ]}
          onValueChange={changeHandler("repeat")}
        />
      </View>
      <View mt="$3" gap="$2">
        <Form.Trigger asChild>
          <Button icon={Save}>Save</Button>
        </Form.Trigger>
        <Button icon={X} variant="outlined" onPress={onClose}>
          Cancel
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
