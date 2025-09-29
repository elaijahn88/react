import React, { useState } from "react";
import { View, TextInput, Button, FlatList, Text } from "react-native";
import { useMessages } from "../useMessages";

export default function ChatScreen() {
  const { messages, sendMessage } = useMessages();
  const [text, setText] = useState("");

  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item.text}</Text>}
      />
      <TextInput value={text} onChangeText={setText} placeholder="Type a message" />
      <Button title="Send" onPress={() => { sendMessage(text); setText(""); }} />
    </View>
  );
}
