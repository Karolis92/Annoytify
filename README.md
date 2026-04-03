# Annoytify

Android app to schedule annoying todo notifications that are impossible to accidentally swipe away and forget.
Works with Android 14 where it's possible for user to swipe away persistent (ongoing) notifications.

## WIP

App is still work in progress

## Setup

App will not work with Expo Go as it utilizes native code to restore notification after boot. Also uses some libraries that provide only native code.

For Expo Go like experience EAS development build can be used (`build:dev` + `start:dev`). For EAS builds install `npm install -g eas-cli`

App can also be built locally with Android Studio and used with emulator (`start:dev:emulator`)

## Scripts

`start:dev` - run development server for development build

`start:dev:emulator` - build and start app on local machine for android emulator ([prerequisites](https://docs.expo.dev/guides/local-app-development/#android) needed)

`build` - build production app (aab) using EAS

`build:dev` - build dev client app using EAS

`build:preview` - build preview app (apk) using EAS

## Realm replacements (local-only)

If you want to move away from Realm for this app's use case (Android-only, local-only todo storage, simple filtering/updates), these are the best options:

1. **Expo SQLite + Drizzle ORM (recommended)**
   - Best fit for Expo/React Native apps that need reliable local relational storage.
   - Strong typing, migrations, and straightforward queries for task lists (`date`, `done`, `repeat`).
   - No vendor lock-in to a sync platform.

2. **WatermelonDB**
   - Great when you need very large datasets and highly reactive list rendering.
   - More setup/complexity than needed for this app today.

3. **react-native-mmkv (+ optional wrapper)**
   - Fast key-value storage, good for settings/small state.
   - Not ideal as a primary store for query-heavy task data.

### Suggested direction for Annoytify

For the current feature set, **Expo SQLite + Drizzle ORM** is the most balanced replacement: simple, local-first, predictable, and well-suited for task CRUD + date/status filtering.
