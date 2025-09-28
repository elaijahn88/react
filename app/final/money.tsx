import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Image,
  FlatList,
} from "react-native";
import Video from "react-native-video";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
};

const getCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString();
};

const sampleTransactions: Transaction[] = [
  { id: "1", title: "Salary", amount: 0, type: "income", date: getCurrentDateTime() },
  { id: "2", title: "Coffee", amount: 0, type: "expense", date: getCurrentDateTime() },
  { id: "3", title: "Kfc", amount: 0, type: "income", date: getCurrentDateTime() },
  { id: "4", title: "Iphones", amount: 0, type: "expense", date: getCurrentDateTime() },
];

// Hierarchical data for Finance section
const financeItems = {
  Banks: [
    {
      name: "Bank of Africa",
      details: "Largest bank in the region. HQ: Nairobi, Kenya.",
    },
    {
      name: "Equity Bank",
      details: "Leading retail bank with mobile banking services.",
    },
  ],
  Sacco: [
    {
      name: "Sacco",
      details: "Savings and credit cooperative for teachers.",
    },
    {
      name: "Healthcare Sacco",
      details: "Serving healthcare professionals.",
    },
  ],
  Microfinance: [
    {
      name: "MicroCred",
      details: "Micro loans and financial inclusion services.",
    },
  ],
  "Credit Societies": [
    {
      name: "Community Credit Union",
      details: "Credit union serving local communities.",
    },
  ],
};

export default function FinanceDashboard() {
  const accountBalance = 0;
  const balanceThreshold = 100000;

  // Top level selected menu (Finance, Others, etc.)
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  // Subcategory inside Finance (Banks, Sacco, etc.)
  const [selectedFinanceCategory, setSelectedFinanceCategory] = useState<string | null>(null);

  // Which item inside category is expanded
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Search text for filtering finance items
  const [searchText, setSearchText] = useState("");

  // For toggling other UI sections
  const [visibleSections, setVisibleSections] = useState({
    video: true,
    accountSummary: true,
    quickActions: true,
    transactions: true,
  });

  // Toggle section visibility for video, accountSummary etc.
  const toggleSection = (key: keyof typeof visibleSections) => {
    setVisibleSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle item press for expanding details with animation
  const onItemPress = (itemName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItem((prev) => (prev === itemName ? null : itemName));
  };

  // Filtered finance items by search
  const filteredFinanceItems = (category: string) => {
    if (!searchText.trim()) return financeItems[category];
    return financeItems[category].filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://xlijah/pics/icon.png" }}
          style={styles.profilePic}
        />
        <Text style={styles.headerText}>MONEY</Text>
      </View>

      {/* Top Menu: Finance, Other (Add more if needed) */}
      <View style={styles.topMenu}>
        <TouchableOpacity
          style={[styles.menuButton, selectedMenu === "Finance" && styles.menuButtonActive]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSelectedMenu(selectedMenu === "Finance" ? null : "Finance");
            setSelectedFinanceCategory(null);
            setExpandedItem(null);
            setSearchText("");
          }}
        >
          <Text style={styles.menuButtonText}>Finance</Text>
        </TouchableOpacity>
        {/* You can add more top menu buttons here */}
      </View>

      {/* If Finance menu selected, show categories */}
      {selectedMenu === "Finance" && (
        <>
          {/* Search bar */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search Banks, Sacco, etc..."
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={setSearchText}
          />

          {/* Categories */}
          <View style={styles.categories}>
            {Object.keys(financeItems).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedFinanceCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setSelectedFinanceCategory(selectedFinanceCategory === category ? null : category);
                  setExpandedItem(null);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedFinanceCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Items List */}
          {selectedFinanceCategory && (
            <View style={{ marginTop: 10 }}>
              {filteredFinanceItems(selectedFinanceCategory).length === 0 ? (
                <Text style={styles.noResultsText}>No results found.</Text>
              ) : (
                filteredFinanceItems(selectedFinanceCategory).map((item) => (
                  <View key={item.name} style={styles.itemContainer}>
                    <TouchableOpacity
                      onPress={() => onItemPress(item.name)}
                      style={styles.itemHeader}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.itemTitle}>{item.name}</Text>
                      <Text style={styles.itemToggle}>{expandedItem === item.name ? "-" : "+"}</Text>
                    </TouchableOpacity>
                    {expandedItem === item.name && (
                      <View style={styles.itemDetailsContainer}>
                        <Text style={styles.itemDetails}>{item.details}</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </>
      )}

      {/* Other toggles like video, account summary, quick actions, transactions */}
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
              onPress={() => null}
            >
              <Text style={styles.summaryLabel}>Savings</Text>
              <Text style={styles.summaryAmount}>0.000 UGX</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.summaryCard, { flex: 1, marginLeft: 10 }]}
              onPress={() => null}
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
            <TouchableOpacity style={styles.actionButton} onPress={() => null}>
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => null}>
              <Text style={styles.actionText}>Receive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => null}>
              <Text style={styles.actionText}>Invest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => null}>
              <Text style={styles.actionText}>Savings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => null}>
              <Text style={styles.actionText}>Loans</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 🔹 Transactions */}
      {visibleSections.transactions && (
        <>
          <Text style={styles.sectionTitle}>Trn_Hstry</Text>
          <FlatList
            data={sampleTransactions}
            renderItem={({ item }) => (
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
            )}
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

  // Header
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

  // Top menu
  topMenu: {
    flexDirection: "row",
    marginBottom: 15,
  },
  menuButton: {
    backgroundColor: "#222",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  menuButtonActive: {
    backgroundColor: "#0f0",
  },
  menuButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Search bar
  searchInput: {
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 10,
  },

  // Categories
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryButton: {
    backgroundColor: "#222",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryButtonActive: {
    backgroundColor: "#0f0",
  },
  categoryText: {
    color: "#fff",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#000",
  },

  // Item container
  itemContainer: {
    backgroundColor: "#111",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  itemTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  itemToggle: {
    fontSize: 20,
    color: "#0f0",
  },
  itemDetailsContainer: {
    backgroundColor: "#222",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  itemDetails: {
    color: "#ccc",
    fontSize: 14,
  },

  noResultsText: {
    color: "#aaa",
    fontStyle: "italic",
    paddingHorizontal: 15,
  },

  // Toggles (video/account/actions)
  toggles: {
    marginVertical: 15,
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
