import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { collection, onSnapshot, query, orderBy, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { authentication, db } from "../firebase/firebaseConfig";


export default function GroupChatScreen({ route }) {
  const uid = route.params.id;
  const [messages, setMessages] = useState([]);
  const currentUser = authentication.currentUser.uid;

console.log(uid);

  useEffect(() => {
    if (uid) {
      console.log(uid);
      const messagesRef = collection(db, 'groups', uid, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedMessages = snapshot.docs.map(doc => ({
          _id: doc.id,
          text: doc.data().text,
          createdAt: doc.data().createdAt.toDate(),
          user: {
            _id: doc.data().user._id,
          },
        }));
        setMessages(updatedMessages);
      }, (error) => {
        console.error('Erreur lors de la récupération des messages :', error);
      });
      return () => unsubscribe();
    }
  }, [uid]);
  
  const onSend = useCallback(async (newMessages = []) => {
    try {
      if (uid && newMessages.length > 0 && currentUser) {
        const message = {
          _id: newMessages[0]._id,
          text: newMessages[0].text,
          createdAt: serverTimestamp(),
          user: {
            _id: currentUser,
          },
        };
        await addDoc(collection(db, 'groups', uid, 'messages'), message);
      } else {
        console.error('Impossible d\'envoyer le message : uid, newMessages ou currentUser est indéfini.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message :', error);
    }
  }, [uid, currentUser]);
  
  
  

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: currentUser,
        }}
      />
    </View>
  );
};
