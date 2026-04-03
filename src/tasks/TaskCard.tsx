import { CalendarClock, Check, Repeat2 } from "@tamagui/lucide-icons";
import { Card, CardProps, Checkbox, Text, View, XStack } from "tamagui";
import { Repeat } from "../common/enums/Repeat";
import { Task } from "./db/models";
import tasksService from "./services/tasksService";

interface TaskCardProps extends CardProps {
  task: Task;
  onDoneChanged: () => void;
}

const TaskCard = ({ task, onDoneChanged, ...cardProps }: TaskCardProps) => {
  const onDoneChange = async (done: boolean) => {
    await tasksService.changeState(task, done);
    onDoneChanged();
  };

  const textDecorationLine = task.done ? "line-through" : undefined;

  return (
    <Card
      bordered
      pressStyle={{ backgroundColor: "$backgroundPress" }}
      {...cardProps}
    >
      <Card.Header p="$3">
        <XStack gap="$2">
          <Checkbox
            size="$5"
            onCheckedChange={onDoneChange}
            checked={task.done}
          >
            <Checkbox.Indicator>
              <Check />
            </Checkbox.Indicator>
          </Checkbox>
          <View flexShrink={1}>
            <Text
              textDecorationLine={textDecorationLine}
              numberOfLines={1}
              fontSize="$5"
              mb="$2"
            >
              {task.title}
            </Text>
            {task.description && (
              <Text textDecorationLine={textDecorationLine} numberOfLines={4}>
                {task.description}
              </Text>
            )}
          </View>
        </XStack>
      </Card.Header>
      <Card.Footer p="$3" pt="0" gap="$2" alignItems="center">
        {task.repeat !== Repeat.No && <Repeat2 size="$1" />}
        <View flexDirection="row" alignItems="center" gap="$2" ml="auto">
          <CalendarClock size="$1" />
          <Text textDecorationLine={textDecorationLine}>
            {task.date.toLocaleString()}
          </Text>
        </View>
      </Card.Footer>
    </Card>
  );
};

export default TaskCard;
