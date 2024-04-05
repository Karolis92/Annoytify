import { Check, CheckSquare, ChevronDown, X } from "@tamagui/lucide-icons";
import { useState } from "react";
import DatePicker from "react-native-date-picker";
import { Button, ListItem, View } from "tamagui";
import Sheet from "./Sheet";

interface DateSelectProps {
  id?: string;
  value?: Date;
  minimumDate?: Date;
  onChange: (date: Date) => void;
}

const DateSelect = ({ id, value, onChange, minimumDate }: DateSelectProps) => {
  const [internalDate, setInternalDate] = useState(value ?? new Date());
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <>
      <ListItem
        id={id}
        iconAfter={ChevronDown}
        onPress={() => {
          setSheetOpen(true);
          setInternalDate(value ?? new Date());
        }}
        radiused
        pressTheme
        borderWidth={1}
      >
        {value?.toLocaleString()}
      </ListItem>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <View gap="$2">
          <View alignItems="center" my="$4">
            <DatePicker
              date={internalDate}
              minimumDate={minimumDate}
              theme="dark"
              onDateChange={setInternalDate}
            />
          </View>
          <Button
            icon={Check}
            onPress={() => {
              onChange(internalDate);
              setSheetOpen(false);
            }}
          >
            Choose
          </Button>
          <Button
            variant="outlined"
            icon={X}
            onPress={() => setSheetOpen(false)}
          >
            Cancel
          </Button>
        </View>
      </Sheet>
    </>
  );
};

export default DateSelect;
