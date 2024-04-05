import { Check, ChevronDown } from "@tamagui/lucide-icons";
import {
  Adapt,
  Sheet,
  Select as TamaguiSelect,
  SelectProps as TamaguiSelectProps,
} from "tamagui";

interface SelectProps extends TamaguiSelectProps {
  items: { text: string; value: string }[];
}

const Select = ({ items, ...props }: SelectProps) => {
  return (
    <TamaguiSelect disablePreventBodyScroll {...props}>
      <TamaguiSelect.Trigger iconAfter={ChevronDown}>
        <TamaguiSelect.Value />
      </TamaguiSelect.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <TamaguiSelect.Viewport>
        {items.map((item, index) => (
          <TamaguiSelect.Item index={index} key={item.value} value={item.value}>
            <TamaguiSelect.ItemText>{item.text}</TamaguiSelect.ItemText>
            <TamaguiSelect.ItemIndicator marginLeft="auto">
              <Check size={16} />
            </TamaguiSelect.ItemIndicator>
          </TamaguiSelect.Item>
        ))}
      </TamaguiSelect.Viewport>
    </TamaguiSelect>
  );
};

export default Select;
