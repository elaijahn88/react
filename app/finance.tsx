import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
};

const sampleTransactions: Transaction[] = [
  { id: "1", title: "Salary", amount: 1200, type: "income", date: "2025-09-01" },
  { id: "2", title: "Coffee", amount: 4.5, type: "expense", date: "2025-09-02" },
  { id: "3", title: "Freelance Project", amount: 450, type: "income", date: "2025-09-03" },
  { id: "4", title: "Groceries", amount: 65, type: "expense", date: "2025-09-04" },
];

export default function FinanceDashboard() {
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
        {item.type === "income" ? "+" : "-"}${item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* 1. Account Summary */}
      <Text style={styles.sectionTitle}>Account Summary</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Balance</Text>
        <Text style={styles.summaryAmount}>$2,345.67</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.summaryLabel}>Credit</Text>
          <Text style={styles.summaryAmount}>$1,200.00</Text>
        </View>
        <View style={[styles.summaryCard, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.summaryLabel}>Savings</Text>
          <Text style={styles.summaryAmount}>$5,600.00</Text>
        </View>
      </View>

      {/* 2. Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Invest</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Recent Transactions */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={sampleTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEnabled={false} // so it scrolls with parent ScrollView
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  summaryCard: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: { color: "#fff", fontSize: 16 },
  summaryAmount: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 5 },
  summaryRow: { flexDirection: "row", marginBottom: 20 },
  actions: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  actionButton: {
    backgroundColor: "#eee",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionText: { fontWeight: "600", fontSize: 16 },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  transactionTitle: { fontSize: 16, fontWeight: "500" },
  transactionDate: { fontSize: 12, color: "#555" },
  transactionAmount: { fontSize: 16, fontWeight: "bold" },
  income: { color: "green" },
  expense: { color: "red" },
});
