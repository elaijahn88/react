.......v1.........

!npm install --global eas-cli && eas login  && eas build --platform android --profile preview --non-interactive && eas build:status


...........v2.........

# 1. Get your project into Colab (clone from GitHub or upload zip)
! git clone 
https://github.com/elaijahn88/raect.git
! cd raect
# 2. Install dependencies
!npm install

# 3. Install EAS CLI
!npm install --global eas-cli

# 4. Login and build (APK instead of AAB if you configured eas.json)
!eas login --token $EAS_TOKEN && \
eas build --platform android --profile production --non-interactive && \
eas build:status




......v3.......
# 🚀 Expo/React Native → APK build pipeline in Colab (from GitHub repo)
!git clone https://github.com/your-username/your-expo-project.git && \
cd your-expo-project && \
npm install && \
npm install --global eas-cli && \
eas login --token $EAS_TOKEN && \
echo '{"build": {"production": {"android": {"buildType": "apk"}}}}' > eas.json && \
eas build --platform android --profile production --non-interactive && \
eas build:status
