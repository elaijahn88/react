1. Install Expo CLI (if not already)
   └── npm install -g expo-cli

2. Create Expo App (if not already)
   └── npx create-expo-app my-app

3. Move into project directory
   └── cd my-app

4. Login to Expo
   └── npx expo login

5. Install EAS CLI
   └── npm install -g eas-cli

6. Configure EAS Build
   └── npx eas init
       ├── creates eas.json
       └── asks for build profile (development/production)

7. Configure app for Android (optional but recommended)
   └── Update app.json or app.config.js with:
       └── android.package (e.g., "com.mycompany.myapp")

8. Build `.apk` file
   └── npx eas build --platform android --profile preview
       └── Builds `.apk` instead of `.aab`

       ✅ Tip: To ensure `.apk` not `.aab`, add to eas.json:
       {
         "build": {
           "preview": {
             "android": {
               "buildType": "apk"
             }
           }
         }
       }

9. Download the `.apk` file
   └── After build finishes, you’ll get a URL in the CLI or from your Expo dashboard:
       https://expo.dev/accounts/yourname/projects/yourproject/builds

10. (Optional) Install on Android device
    └── adb install your-app.apk
