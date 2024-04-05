# Annoytify

Android app to schedule annoying todo notifications that are impossible to accidentally swipe away and forget.
Works with Android 14 where it's possible for user to swipe away persistent (ongoing) notifications.

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