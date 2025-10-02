import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { sendMessage } from './firebaseHelpers';

const ChatScreen = ({ chatId, currentUserId, otherUserId }: { chatId: string, currentUserId: string, otherUserId: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [chatId]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(chatId, currentUserId, otherUserId, input);
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.msg, item.sender === currentUserId ? styles.myMsg : styles.otherMsg]}>
            <Text style={{ color: '#fff' }}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10 }}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type..." placeholderTextColor="#aaa" />
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}><Text style={{ color: '#fff' }}>Send</Text></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  msg: { padding: 10, marginVertical: 5, borderRadius: 10, maxWidth: '70%' },
  myMsg: { backgroundColor: '#007aff', alignSelf: 'flex-end' },
  otherMsg: { backgroundColor: '#555', alignSelf: 'flex-start' },
  inputRow: { flexDirection: 'row', padding: 10, backgroundColor: '#222' },
  input: { flex: 1, backgroundColor: '#333', color: '#fff', borderRadius: 20, paddingHorizontal: 15 },
  sendBtn: { marginLeft: 10, backgroundColor: '#007aff', borderRadius: 20, paddingHorizontal: 15, justifyContent: 'center' },
});

export default ChatScreen;
