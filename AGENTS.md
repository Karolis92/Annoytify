# Annoytify - Codex Instructions

## Project Overview

Annoytify is an Android-only React Native app built with Expo that schedules
persistent, hard-to-dismiss todo notifications. It targets Android 14+, where
the OS allows users to swipe away ongoing notifications; the app restores
dismissed notifications automatically and supports daily/monthly recurrence.

The app cannot run on Expo Go because it uses native modules. Use an EAS
development build or a local Android build instead.

## Tech Stack

| Layer          | Library                                               |
| -------------- | ----------------------------------------------------- |
| Framework      | React Native 0.83 / Expo 55                           |
| Language       | TypeScript (strict mode + `noUncheckedIndexedAccess`) |
| UI components  | Tamagui v2 RC                                         |
| Icons          | `@tamagui/lucide-icons-2`                             |
| Navigation     | React Navigation v7 (native stack)                    |
| Local database | Expo SQLite + Drizzle ORM                             |
| Notifications  | Native Android Expo module                            |
| Date utilities | `date-fns` v4                                         |
| Formatting     | Prettier (config in `.prettierrc`)                    |

## Repository Structure

```text
src/
  common/
    components/   # Shared UI components (DateSelect, Select, Sheet)
    db/           # Expo SQLite database, Drizzle schema, generated migrations
    enums/        # Shared enums (Repeat, PressAction, NotificationChannels)
    utils/        # Utility functions (dateUtils)
  navigation/     # RootNavigator and param list types
  settings/       # Settings screen
  tasks/
    db/           # Task repository backed by Drizzle
    events/       # Boot and notification event registration
    hooks/        # Live task query hooks
    services/     # TasksService and NotificationsService
    TaskCard.tsx
    TaskForm.tsx
    TasksScreen.tsx
  theme/          # AppTheme provider and ThemedStatusBar
modules/          # Native Android modules
App.tsx           # Entry point
app.config.js     # Expo config (reads APP_VARIANT env var)
```

## Key Architectural Patterns

- Feature-based folder structure: code is grouped under `src/tasks/`,
  `src/settings/`, etc.
- Async service/repository access: `getTasksService()` and
  `getTasksRepository()` resolve shared instances after the SQLite database has
  been opened and migrated; `notificationsService` remains a singleton.
- Repository pattern: `tasksRepository` wraps Drizzle select/insert/update/
  delete operations for the `tasks` table.
- Database schema: tasks are defined in `src/common/db/schema.ts` with Drizzle
  `sqliteTable(...)`, and `Task`/`NewTask` types are inferred from the schema.
- App startup wiring: `App.tsx` registers the boot headless task and
  notification event task handler at module load, then calls
  `useNotificationPermissionAndRestore()` from `src/tasks/hooks/` during
  render.
- Data access in UI: task hooks use React `use(...)` with Drizzle
  `useLiveQuery(...)` so screens stay in sync with SQLite changes.
- Navigation: typed with `RootNavigatorParamList`; use
  `createNativeStackNavigator<RootNavigatorParamList>()`.
- Theming: use Tamagui `useTheme()` hook for colours; never hard-code colour
  values.

## Code Conventions

- Use TypeScript strict mode; all new code must be fully typed.
- Follow existing Prettier formatting (`pnpm format` applies it).
- Use `async/await` for asynchronous code.
- Enums live in `src/common/enums/`; add new shared enums there.
- Database schema changes live in `src/common/db/schema.ts`; regenerate
  migrations with `npm run generate:schema` when needed.
- Shared UI components go in `src/common/components/`.
- Feature-specific files stay inside the feature folder (e.g. `src/tasks/`).
- Do not add inline `console.log` statements beyond what already exists for
  notification events.

## Development Scripts

```bash
pnpm dev:start       # Start Expo dev server (requires EAS dev build on device)
pnpm dev:run         # Build and run on local Android emulator or user device
pnpm build           # EAS production build (AAB)
pnpm build:dev       # EAS development build
pnpm build:preview   # EAS preview build (APK)
pnpm build:local     # Local APK build with Gradle
pnpm generate:schema # Generate Drizzle migrations from schema changes
pnpm format          # Run Prettier on the whole project
```

## Important Notes

- Android only: Android is the only supported/released platform.
  `app.config.js` may still contain `ios` and `web` configuration blocks for
  Expo tooling compatibility, but those targets are not maintained and should
  not be treated as active targets; do not add iOS- or web-specific code.
- The app must survive process death and device reboots. Boot restoration is
  triggered from `src/tasks/events/bootEvents.ts` via
  `registerOnBootTask` in `modules/on-boot`; notification swipe dismissal and
  action handling are registered in
  `src/tasks/events/notificationEvents.ts` via `modules/notifications`.
- Notifications are created as `ongoing: true` and `autoCancel: false` so they
  persist even after the user swipes them away.
- When creating a recurring task that is marked done, a new row with a fresh
  generated `id` is inserted for the next occurrence; the original task's
  `repeat` field is set to `Repeat.No`.
- Scheduled reminders depend on notification permission and exact alarm
  capability; the app requests notification permission on startup and restores
  scheduled notifications when exact alarms are available.
