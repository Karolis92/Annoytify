import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ArrowLeft, Settings2 } from "@tamagui/lucide-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, useTheme } from "tamagui";
import TasksScreen from "../screens/TasksScreen/TasksScreen";
import SettingsScreen from "../screens/SettingsScreen/SettingsScreen";
import RootNavigatorParamList from "./RootNavigatorParamList";

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

const RootNavigation = () => {
  const theme = useTheme();

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.background.get() }}>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            background: theme.background.get(),
            border: theme.blue10.get(),
            card: theme.background.get(),
            notification: theme.background.get(),
            primary: theme.background.get(),
            text: theme.color.get(),
          },
        }}
      >
        <Stack.Navigator
          screenOptions={({ navigation }) => ({
            headerTitleAlign: "center",
            headerBackVisible: false,
            headerLeft: ({ canGoBack }) =>
              canGoBack && (
                <Button
                  icon={ArrowLeft}
                  scaleIcon={1.75}
                  circular
                  chromeless
                  onPress={() => navigation.goBack()}
                />
              ),
          })}
        >
          <Stack.Screen
            name="TasksScreen"
            options={({ navigation }) => ({
              title: "Tasks",
              headerRight: () => (
                <Button
                  icon={Settings2}
                  scaleIcon={1.75}
                  circular
                  chromeless
                  onPress={() => navigation.navigate("SettingsScreen")}
                />
              ),
            })}
            component={TasksScreen}
          />
          <Stack.Screen
            name="SettingsScreen"
            options={{ title: "Settings" }}
            component={SettingsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default RootNavigation;
