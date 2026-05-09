# Annoytify

Android app to schedule annoying todo notifications that are impossible to accidentally swipe away and forget.
Works with Android 14 where it's possible for user to swipe away persistent (ongoing) notifications.

## WIP

App is still work in progress

## Setup

App will not work with Expo Go as it utilizes native code to restore notification after boot and requires development build.

For Expo Go like experience EAS development build can be used (`build:dev` + `dev:start`). For EAS builds install `npm install -g eas-cli`.

Development build can also be built locally with Android Studio and used with emulator or your device (`dev:run`)

Preview version for testing can also be build locally (`build:local`), built apk is in `android\app\build\outputs\apk\release\app-release.apk`.

## Scripts

`dev:start` - run development server for development build

`dev:run` - build and start app on local machine for android emulator ([prerequisites](https://docs.expo.dev/guides/local-app-development/#android) needed). If gradle build is failing - try reinstalling NDK trough android studio.

`build` - build production app (aab) using EAS

`build:dev` - build dev client app using EAS

`build:preview` - build preview app (apk) using EAS

`build:local` - build preview app (apk) locally
