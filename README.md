# QuickNotes

React + Vite notes app: notes with bullets, checklists/to-dos with progress, conversations, voice-to-text (Web Speech API), tags, colors, pin, archive, search, and sharing (Web Share / clipboard / .txt export). Data is stored in localStorage.

    npm install
    npm run dev

## Android app

The app is wrapped with Capacitor (`android/`). A GitHub Actions workflow (`.github/workflows/android.yml`) builds a debug APK on every push: open the run's **Actions** page and download the `QuickNotes-debug-apk` artifact, copy it to your phone and install it (allow "install unknown apps").

To build locally (needs Android Studio / SDK + JDK 21): `npm run build && npx cap sync android && npx cap open android`.
