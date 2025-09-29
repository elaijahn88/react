import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'; // If you're using React Web, use divs instead

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // make sure this is your configured Firestore instance

export default function UserFetcher() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUser = async () => {
    setLoading(true);
    setError('');
    setEmail('');

    try {
      // Fetch from collection 'users', document ID 'users'
      const userRef = doc(db, 'users', 'users');
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setEmail(data.email || 'No email found');
      } else {
        setError('Document "users" not found in "users" collection.');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching user document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fetch Email from /users/users</Text>
      <Button title="Fetch Email" onPress={fetchUser} />
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
      {email ? <Text style={styles.result}>Email: {email}</Text> : null}
      {error ? <Text style={styles.error}>Network!!!</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 16,
    marginBottom: 12,
  },
  result: {
    marginTop: 10,
    fontSize: 16,
    color: 'green',
  },
  error: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
  },
});
