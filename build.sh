
# 🚀 Expo/React Native → APK build pipeline in Colab (from GitHub repo)
!git clone https://github.com/your-username/your-expo-project.git && \
cd raect && \
npm install && \
npm install -g eas-cli && \
eas login  && \
echo '{"build": {"production": {"android": {"buildType": "apk"}}}}' > eas.json && \
eas build --platform android --profile preview && \
eas build:status
