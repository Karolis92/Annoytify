# Annoytify – Copilot Instructions

## Project Overview

Annoytify is an **Android-only** React Native app built with Expo that schedules persistent, hard-to-dismiss todo notifications. It targets Android 14+, where the OS allows users to swipe away ongoing notifications; the app restores dismissed notifications automatically and supports daily/monthly recurrence.

The app **cannot** run on Expo Go because it uses native modules. Use an EAS development build or a local Android Studio build instead.

## Tech Stack

| Layer          | Library                                               |
| -------------- | ----------------------------------------------------- |
| Framework      | React Native 0.83 / Expo 55                           |
| Language       | TypeScript (strict mode + `noUncheckedIndexedAccess`) |
| UI components  | Tamagui v1                                            |
| Icons          | `@tamagui/lucide-icons`                               |
| Navigation     | React Navigation v6 (native stack)                    |
| Local database | Realm / `@realm/react`                                |
| Notifications  | `@notifee/react-native`                               |
| Date utilities | `date-fns` v4                                         |
| Formatting     | Prettier (config in `.prettierrc`)                    |

## Repository Structure

```
src/
  common/
    components/   # Shared UI components (DateSelect, Select, Sheet)
    db/           # Realm configuration and AppRealmProvider
    enums/        # Shared enums (Repeat, PressAction, NotificationChannels)
    utils/        # Utility functions (dateUtils)
  navigation/     # RootNavigator and param list types
  settings/       # Settings screen
  tasks/
    db/           # Task Realm model and repository
    services/     # TasksService and NotificationsService
    TaskCard.tsx
    TaskForm.tsx
    TasksScreen.tsx
    useTaskNotificationEvents.ts
  theme/          # AppTheme provider and ThemedStatusBar
modules/          # Native on-boot module (registerOnBootTask)
App.tsx           # Entry point
app.config.js     # Expo config (reads APP_VARIANT env var)
```

## Key Architectural Patterns

- **Feature-based folder structure**: code is grouped under `src/tasks/`, `src/settings/`, etc.
- **Singleton services**: `tasksService` and `notificationsService` are exported as singleton instances of their respective classes.
- **Repository pattern**: `tasksRepository` wraps all Realm write/query operations for the `Task` model.
- **Realm models**: extend `Realm.Object` and implement a matching `ITask` interface; always define a static `schema` property.
- **Navigation**: typed with `RootNavigatorParamList`; use `createNativeStackNavigator<RootNavigatorParamList>()`.
- **Theming**: use Tamagui `useTheme()` hook for colours; never hard-code colour values.

## Code Conventions

- Use TypeScript strict mode; all new code must be fully typed.
- Follow existing Prettier formatting (`npm run format` applies it).
- Use `async/await` for asynchronous code.
- Enums live in `src/common/enums/`; add new shared enums there.
- Shared UI components go in `src/common/components/`.
- Feature-specific files stay inside the feature folder (e.g. `src/tasks/`).
- Do not add inline `console.log` statements beyond what already exists for notification events.

## Development Scripts

```bash
npm run start:dev             # Start Expo dev server (requires EAS dev build on device)
npm run start:dev:emulator    # Build and run on local Android emulator
npm run build                 # EAS production build (AAB)
npm run build:dev             # EAS development build
npm run build:preview         # EAS preview build (APK)
npm run format                # Run Prettier on the whole project
```

## Important Notes

- **Android only**: Android is the only supported/released platform. `app.config.js` may still contain `ios` and `web` configuration blocks for Expo tooling compatibility, but those targets are not maintained and should not be treated as active targets; do not add iOS- or web-specific code.
- The app must survive process death and device reboots – notification restoration on boot is handled by `registerOnBootTask` in `modules/on-boot`.
- Notifications are created as `ongoing: true` and `autoCancel: false` so they persist even after the user swipes them away.
- `Task._id` is a `BSON.ObjectId`; always call `.toString()` before passing it to notification APIs.
- When creating a recurring task that is marked done, a new `Task` document with a fresh `_id` is inserted for the next occurrence; the original task's `repeat` field is set to `Repeat.No`.
