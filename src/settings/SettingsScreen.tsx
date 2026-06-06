import { Settings2 } from "@tamagui/lucide-icons-2";
import { Button, YStack } from "tamagui";
import { usePermissionSheet } from "../tasks/PermissionSheet";

const SettingsScreen = () => {
  const { openPermissionSheet } = usePermissionSheet();

  return (
    <YStack padding="$3" gap="$4">
      <Button icon={Settings2} onPress={openPermissionSheet}>
        Review startup permissions
      </Button>
    </YStack>
  );
};

export default SettingsScreen;
