import { SheetProps, Sheet as TamaguiSheet } from "tamagui";

const Sheet = (sheetsProps: SheetProps) => {
  return (
    <TamaguiSheet
      dismissOnSnapToBottom
      modal
      unmountChildrenWhenHidden
      snapPointsMode="fit"
      {...sheetsProps}
    >
      <TamaguiSheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <TamaguiSheet.Handle bg="$backgroundPress" />
      <TamaguiSheet.Frame>{sheetsProps.children}</TamaguiSheet.Frame>
    </TamaguiSheet>
  );
};

export default Sheet;
