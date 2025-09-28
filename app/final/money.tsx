import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import Video from "react-native-video";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
};

// 🔹 Utility: get current datetime
const getCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString(); // Example: "9/24/2025, 11:32:45 AM"
};

// 🔹 Sample transactions (all zero amounts)
const sampleTransactions: Transaction[] = [
  { id: "1", title: "Salary", amount: 0, type: "income", date: getCurrentDateTime() },
  { id: "2", title: "Coffee", amount: 0, type: "expense", date: getCurrentDateTime() },
  { id: "3", title: "Kfc", amount: 0, type: "income", date: getCurrentDateTime() },
  { id: "4", title: "Iphones", amount: 0, type: "expense", date: getCurrentDateTime() },
];

export default function FinanceDashboard() {
  const accountBalance = 0; // Set account balance to 0
  const balanceThreshold = 100000;

  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // 🔹 Section visibility state
  const [visibleSections, setVisibleSections] = useState({
    video: true,
    accountSummary: true,
    quickActions: true,
    transactions: true,
  });

  const toggleSection = (key: keyof typeof visibleSections) => {
    setVisibleSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          item.type === "income" ? styles.income : styles.expense,
        ]}
      >
        {item.type === "income" ? "+" : "-"}UGX {item.amount.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://xlijah/pics/icon.png" }}
          style={styles.profilePic}
        />
        <Text style={styles.headerText}>MONEY_GRAM</Text>
      </View>

      {/* 🔹 Section Toggles */}
      <View style={styles.toggles}>
        <TouchableOpacity onPress={() => toggleSection("video")}>
          <Text style={styles.toggleText}> Video</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleSection("accountSummary")}>
          <Text style={styles.toggleText}>Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleSection("quickActions")}>
          <Text style={styles.toggleText}>Actions</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleSection("transactions")}>
          <Text style={styles.toggleText}>Transactions</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Video Section */}
      {visibleSections.video && (
        <>
          <Text style={styles.sectionTitle}>Economy</Text>
          <Video
            source={{ uri: "https://xlijah.com/ai.mp4" }}
            style={styles.video}
            controls={false}
            paused={false}
            resizeMode="contain"
            repeat={true}
            ignoreSilentSwitch="ignore"
            onError={(e) => console.log("Video error:", e)}
          />
        </>
      )}

      {/* 🔹 Account Summary */}
      {visibleSections.accountSummary && (
        <>
          <Text style={styles.sectionTitle}>Account..</Text>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: accountBalance > balanceThreshold ? "green" : "red" },
            ]}
          >
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={styles.summaryAmount}>{accountBalance.toLocaleString()} UGX</Text>
          </View>

          <View style={styles.summaryRow}>
            <TouchableOpacity
              style={[styles.summaryCard, { flex: 1, marginRight: 10 }]}
              onPress={() => setSelectedAction("Savings")}
            >
              <Text style={styles.summaryLabel}>Savings</Text>
              <Text style={styles.summaryAmount}>0.000 UGX</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.summaryCard, { flex: 1, marginLeft: 10 }]}
              onPress={() => setSelectedAction("Loans")}
            >
              <Text style={styles.summaryLabel}>Loans</Text>
              <Text style={styles.summaryAmount}>0.000 UGX</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 🔹 Quick Actions */}
      {visibleSections.quickActions && (
        <>
          <Text style={styles.sectionTitle}>FST_ACT</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedAction("Send Money")}>
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedAction("Receive Money")}>
              <Text style={styles.actionText}>Receive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedAction("Investments")}>
              <Text style={styles.actionText}>Invest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedAction("Savings")}>
              <Text style={styles.actionText}>Savings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedAction("Loans")}>
              <Text style={styles.actionText}>Loans</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 🔹 Dynamic Action Card */}
      {selectedAction && (
        <View style={styles.actionCard}>
          <Text style={styles.actionCardText}>👉 {selectedAction} selected</Text>
        </View>
      )}

      {/* 🔹 Transactions */}
      {visibleSections.transactions && (
        <>
          <Text style={styles.sectionTitle}>Trn_Hstry</Text>
          <FlatList
            data={sampleTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            scrollEnabled={false}
          />
        </>
      )}
    </ScrollView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#000" },

  // 🔹 Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerText: { fontSize: 20, fontWeight: "bold", color: "#fff" },

  // 🔹 Toggle buttons
  toggles: {
    marginBottom: 15,
  },
  toggleText: {
    color: "#0f0",
    fontSize: 14,
    paddingVertical: 5,
  },

  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, color: "#fff" },
  video: { width: width - 30, height: 200, marginBottom: 15, borderRadius: 12 },

  summaryCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: { color: "#fff", fontSize: 16 },
  summaryAmount: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 5 },
  summaryRow: { flexDirection: "row", marginBottom: 20 },

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#eee",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
    minWidth: "40%",
    alignItems: "center",
  },
  actionText: { fontWeight: "600", fontSize: 16 },

  // 🔹 Dynamic Action Card
  actionCard: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#444",
    alignItems: "center",
  },
  actionCardText: { color: "#0f0", fontSize: 16, fontWeight: "600" },

  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#555",
    marginBottom: 10,
    backgroundColor: "#111",
  },
  transactionTitle: { fontSize: 16, fontWeight: "500", color: "#fff" },
  transactionDate: { fontSize: 12, color: "#aaa" },
  transactionAmount: { fontSize: 16, fontWeight: "bold" },
  income: { color: "limegreen" },
  expense: { color: "red" },
});
