import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  AdMobBanner,
  AdMobInterstitial,
  AdMobRewarded,
} from "expo-ads-admob";

export default function App() {
  useEffect(() => {
    // Load and show an interstitial ad
    const loadAd = async () => {
      await AdMobInterstitial.setAdUnitID("ca-app-pub-3940256099942544/1033173712"); // Test ID
      await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
      await AdMobInterstitial.showAdAsync();
    };

    loadAd();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native Ads Example</Text>

      {/* ✅ Banner Ad */}
      <AdMobBanner
        bannerSize="fullBanner"
        adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID
        servePersonalizedAds
        onDidFailToReceiveAdWithError={(err) => console.log("Ad error:", err)}
      />

      {/* ✅ Rewarded Ad button (user watches to unlock something) */}
      <Text style={{ marginTop: 20, fontSize: 16 }}>
        Rewarded ads can be triggered with:
      </Text>
      <Text
        style={styles.rewardButton}
        onPress={async () => {
          await AdMobRewarded.setAdUnitID("ca-app-pub-3940256099942544/5224354917"); // Test ID
          await AdMobRewarded.requestAdAsync();
          await AdMobRewarded.showAdAsync();
        }}
      >
        ▶ Watch Rewarded Ad
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, marginBottom: 20 },
  rewardButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007AFF",
    color: "#fff",
    borderRadius: 8,
  },
});
