import { Check, ChevronDown } from "@tamagui/lucide-icons-2";
import {
  Adapt,
  Select as TamaguiSelect,
  SelectProps as TamaguiSelectProps,
} from "tamagui";
import Sheet from "./Sheet";

interface SelectProps<
  Value extends string = string,
> extends TamaguiSelectProps<Value> {
  items: { text: string; value: Value }[];
}

const Select = <Value extends string = string>({
  items,
  ...props
}: SelectProps<Value>) => {
  return (
    <TamaguiSelect
      disablePreventBodyScroll
      // fix bug where displayed value doesn't update when value changes asynchronously
      key={props.value}
      {...props}
    >
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
