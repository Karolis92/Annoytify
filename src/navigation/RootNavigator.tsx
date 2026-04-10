import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ArrowLeft, Settings2 } from "@tamagui/lucide-icons-2";
import { Suspense } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, Spinner, useTheme } from "tamagui";
import SettingsScreen from "../settings/SettingsScreen";
import TasksScreen from "../tasks/TasksScreen";
import RootNavigatorParamList from "./RootNavigatorParamList";

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

const RootNavigator = () => {
  const theme = useTheme();

  return (
    <SafeAreaProvider
      // match navigation animation background
      style={{ backgroundColor: theme.background.get() }}
    >
      <NavigationContainer
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: theme.background.get(),
            border: theme.borderColor.get(),
            card: theme.background.get(),
            notification: theme.background.get(),
            primary: theme.background.get(),
            text: theme.color.get(),
          },
        }}
      >
        <Stack.Navigator
          screenLayout={({ children }) => (
            <Suspense
              fallback={
                <Spinner
                  size="large"
                  inset={0}
                  position="absolute"
                  alignItems="center"
                  justifyContent="center"
                />
              }
            >
              {children}
            </Suspense>
          )}
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

export default RootNavigator;
