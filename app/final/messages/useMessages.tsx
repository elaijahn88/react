import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { database, ref, push, onValue } from "./firebase";

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    const messagesRef = ref(database, "messages");
    onValue(messagesRef, snapshot => {
      const data = snapshot.val() || {};
      const loadedMessages = Object.values(data);
      setMessages(loadedMessages);
      AsyncStorage.setItem("offlineMessages", JSON.stringify(loadedMessages));
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (text) => {
    const newMessage = { text, timestamp: Date.now() };

    if (isConnected) {
      await push(ref(database, "messages"), newMessage);
    } else {
      const offlineQueue = JSON.parse(await AsyncStorage.getItem("offlineQueue")) || [];
      offlineQueue.push(newMessage);
      await AsyncStorage.setItem("offlineQueue", JSON.stringify(offlineQueue));
    }
  };

  const syncOfflineMessages = async () => {
    const offlineQueue = JSON.parse(await AsyncStorage.getItem("offlineQueue")) || [];
    for (const msg of offlineQueue) {
      await push(ref(database, "messages"), msg);
    }
    await AsyncStorage.removeItem("offlineQueue");
  };

  useEffect(() => {
    if (isConnected) {
      syncOfflineMessages();
    }
  }, [isConnected]);

  return { messages, sendMessage };
};
