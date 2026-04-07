import { Label, View } from "tamagui";
import Select from "../common/components/Select";
import { ThemePreference } from "../common/enums/ThemePreference";
import { useAppTheme } from "../theme/ThemeContext";

const SettingsScreen = () => {
  const { themePreference, setThemePreference } = useAppTheme();

  return (
    <View padding="$3" gap="$3">
      <View>
        <Label>Theme</Label>
        <Select
          value={themePreference}
          items={[
            { value: ThemePreference.System, text: "System" },
            { value: ThemePreference.Light, text: "Light" },
            { value: ThemePreference.Dark, text: "Dark" },
          ]}
          onValueChange={(value) =>
            setThemePreference(value as ThemePreference)
          }
        />
      </View>
    </View>
  );
};

export default SettingsScreen;
