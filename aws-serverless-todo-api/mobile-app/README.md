# Todo Mobile App (Expo / React Native)

A simple mobile front-end for the [aws-serverless-todo-api](../) project. Add, complete, and
delete tasks from your phone — talking directly to your deployed AWS API.

Each device gets its own persistent UUID (stored locally via `AsyncStorage`) sent as the
`X-User-Id` header on every request, so this app only ever sees its own tasks — matching the
isolation built into the backend.

## Before you start: point it at your API

Open `services/api.js` and update this line with **your own** deployed API URL:

```js
const BASE_URL = 'https://dr2ep70ghd.execute-api.us-east-1.amazonaws.com/dev';
```

(This is already set to the stack you deployed earlier — change it only if you redeploy to a
new stack and get a different URL.)

## Option A — Fastest way to try it: Expo Go (no build required)

This runs the real app on your actual phone in a couple of minutes, with no Android Studio or
APK build needed. Great for testing; **not** what you'd share/install as a standalone app.

1. Install Node.js if you haven't already (you already have it from the backend setup).
2. Install the **Expo Go** app on your Android phone from the Play Store.
3. In this folder:
   ```bash
   npm install
   npx expo start
   ```
4. A QR code appears in your terminal. Open the **Expo Go** app on your phone and scan it.
5. The app loads on your phone, talking live to your deployed API.

## Option B — Build a real, installable `.apk`

This produces an actual APK file you can install directly on any Android phone (or share),
without needing Expo Go.

1. Create a free account at https://expo.dev if you don't have one.
2. Install the EAS CLI and log in:
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. From this folder, configure the project for building (one-time):
   ```bash
   eas build:configure
   ```
   Choose **Android** when prompted.
4. Kick off the build:
   ```bash
   eas build --platform android --profile preview
   ```
   This uploads your project to Expo's cloud build servers (no Android SDK needed on your own
   machine) and compiles a real `.apk`. It takes several minutes — you'll get a link to track
   progress, and a download link for the finished `.apk` once it's done.
5. Download the `.apk` from that link, transfer it to your phone (or open the link directly on
   the phone's browser), and install it. You may need to allow "install from unknown sources" in
   Android's settings the first time.

> If `eas build:configure` doesn't already create an `eas.json`, or asks you to choose a build
> profile, choosing **preview** (rather than **production**) gives you a directly-installable
> APK instead of a Play-Store-only `.aab` bundle.

## Option C — Build locally with Android Studio (no Expo cloud account)

If you'd rather not use Expo's cloud build service:

1. Install [Android Studio](https://developer.android.com/studio) (includes the Android SDK).
2. Generate the native Android project files:
   ```bash
   npx expo prebuild --platform android
   ```
3. Open the generated `android/` folder in Android Studio, or build from the command line:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
4. The `.apk` will be at `android/app/build/outputs/apk/release/app-release.apk`.

This route gives you full control and no Expo account dependency, but requires the full Android
SDK toolchain installed locally (a few GB) and is slower to set up the first time.

## What's in this app

- **List tasks** — pulled from `GET /tasks`, pull-to-refresh supported
- **Add a task** — title (required) + description (optional)
- **Toggle complete** — tap the circle next to a task; updates optimistically, reverts if the
  API call fails
- **Delete a task** — tap the trash icon, confirms before deleting

## Project structure

```
mobile-app/
├── App.js                 # Main UI: task list, add form, complete/delete
├── services/api.js        # API client + persistent per-device user id
├── app.json                # Expo app configuration (name, icon, bundle id)
├── babel.config.js
├── package.json
└── assets/                 # App icon / splash screen (placeholder colors — swap these out!)
```

## Customizing before you build for real

- **App name / package id**: edit `app.json` — change `name`, `android.package`
  (e.g. `com.yourname.todoapp`), and `ios.bundleIdentifier` to something unique to you.
- **Icon / splash screen**: replace the placeholder solid-color PNGs in `assets/` with your own
  artwork (recommended: 1024×1024 for `icon.png`/`adaptive-icon.png`).
- **Colors**: the header/button color (`#4F46E5`, an indigo) is set directly in `App.js`'s
  `StyleSheet` — search for that hex code to reskin.
