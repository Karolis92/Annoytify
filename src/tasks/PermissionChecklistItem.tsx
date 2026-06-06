import { Bell, Check } from "@tamagui/lucide-icons-2";
import { ReactNode } from "react";
import { Button, Text, XStack, YStack } from "tamagui";

interface PermissionChecklistItemProps {
  icon: typeof Bell;
  title: string;
  description: string;
  complete: boolean;
  children?: ReactNode;
}

const PermissionChecklistItem = ({
  icon,
  title,
  description,
  complete,
  children,
}: PermissionChecklistItemProps) => {
  const Icon = complete ? Check : icon;

  return (
    <XStack gap="$3" alignItems="flex-start">
      <Button icon={Icon} circular disabled />
      <YStack flex={1} gap="$2">
        <YStack gap="$1">
          <XStack gap="$2" alignItems="center">
            <Text fontWeight="600">{title}</Text>
            {complete ? <Text color="$color10">Complete</Text> : null}
          </XStack>
          <Text color="$color10">{description}</Text>
        </YStack>

        {children}
      </YStack>
    </XStack>
  );
};

export default PermissionChecklistItem;
