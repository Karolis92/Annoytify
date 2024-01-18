import { AppRegistry } from "react-native";

export function registerOnBootTask(task: () => Promise<void>) {
  AppRegistry.registerHeadlessTask("anoytify-onboot", () => task);
}
