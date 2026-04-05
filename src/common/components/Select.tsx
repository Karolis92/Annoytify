import { Check, ChevronDown } from "@tamagui/lucide-icons-2";
import {
  Adapt,
  Select as TamaguiSelect,
  SelectProps as TamaguiSelectProps,
} from "tamagui";
import Sheet from "./Sheet";

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
        <Sheet>
          <Adapt.Contents />
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
