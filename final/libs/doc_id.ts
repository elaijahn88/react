import firestore from '@react-native-firebase/firestore';
import { useEffect } from 'react';

// Global variable to hold the docId
export let GLOBAL_DOC_ID: string | null = null;

// Optional: hold the entire doc data if needed
export let GLOBAL_DOC_DATA: any = null;

// Function to start listening to a Firestore document
export const listenToUserDoc = (email: string) => {
  const unsubscribe = firestore()
    .collection('users')
    .where('email', '==', email)
    .limit(1)
    .onSnapshot(snapshot => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        GLOBAL_DOC_ID = doc.id;
        GLOBAL_DOC_DATA = doc.data();
        console.log('Global docId updated:', GLOBAL_DOC_ID);
      } else {
        GLOBAL_DOC_ID = null;
        GLOBAL_DOC_DATA = null;
        console.log('No matching document found');
      }
    }, error => {
      console.error('Firestore listener error:', error);
    });

  return unsubscribe; // Call unsubscribe() when you want to stop listening
};
