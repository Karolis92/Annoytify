# Annoytify

Android app to schedule annoying todo notifications that are impossible to accidentally swipe away and forget.
Works with Android 14 where it's possible for user to swipe away persistent (ongoing) notifications.

## WIP

App is still work in progress

## Setup

App will not work with Expo Go as it utilizes native code to restore due notifications and re-schedule future reminders after boot. Also uses some libraries that provide only native code.

For Expo Go like experience EAS development build can be used (`build:dev` + `start:dev`). For EAS builds install `npm install -g eas-cli`

App can also be built locally with Android Studio and used with emulator (`start:dev:emulator`)

## Scripts

`start:dev` - run development server for development build

`start:dev:emulator` - build and start app on local machine for android emulator ([prerequisites](https://docs.expo.dev/guides/local-app-development/#android) needed). If gradle build is failing - try reinstalling NDK trough android studio.

`build` - build production app (aab) using EAS

`build:dev` - build dev client app using EAS

`build:preview` - build preview app (apk) using EAS

## Native Android reminder flow

- Reminder channels and scheduled reminder payloads are persisted in native Android storage so boot/package-replaced flows do not depend on React Native startup.
- `modules/notifications` restores persisted reminders on `LOCKED_BOOT_COMPLETED`, `BOOT_COMPLETED`, and `MY_PACKAGE_REPLACED`.
- `modules/on-boot` still runs a headless JS reconciliation pass after boot so the SQLite task store and native reminder store can converge.
- Ongoing reminder dismiss events are handled natively first, then forwarded to JS for app-level state updates.

## Manual Android verification

- Create a future task, reboot the device, and verify the reminder is still scheduled.
- Create a due task, reboot the device, and verify the ongoing notification is restored after boot.
- Dismiss an ongoing notification on Android 14+ and verify it is immediately re-shown.
- Press the `Done` action and verify the task is completed and recurring tasks create the next occurrence only once.
- Revoke exact alarm permission on Android 12+, create a future task, grant the permission again, and verify the reminder is restored on the next app launch or reboot.
- Update/reinstall the app package and verify future reminders are re-scheduled without duplicates.
