import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import { authentication, db } from '../firebase/firebaseConfig'
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'

export default function Chat({ route }) {
    const uid = route.params.uid
    const currentUser = authentication?.currentUser?.uid;
    const [messages, setMessages] = useState([])

    // useEffect(() => {
    //   setMessages([
    //     {
    //       _id: 1,
    //       text: 'Hello developer',
    //       createdAt: serverTimestamp(),
    //       user: {
    //         _id: 2,
    //         name: 'React Native',
    //         avatar: 'https://placeimg.com/140/140/any',
    //       },
    //     },
    //   ])
    // }, [])

    useEffect(() => {
        const chatId = uid > currentUser ? `${uid + '-' + currentUser}` : `${currentUser + '-' + uid}`;
        const documentRef = doc(db, 'chatRooms', chatId);
        const collectionRef = collection(documentRef, 'messages');
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
        const docSnap = onSnapshot(q, (onSnap) => {
            const allMessages = onSnap.docs.map((mes, index) => ({
                ...mes.data(),
                _id: index.toString(), // Ajoutez une clé _id unique pour chaque message
                createdAt: mes.data().createdAt.toDate()
            }));
            setMessages(allMessages);
        });
    }, []);
  
    const onSend = useCallback((messagesArray) => {
        const msg = messagesArray[0];
        const chatId = uid > currentUser ? `${uid + '-' + currentUser}` : `${currentUser + '-' + uid}`
        const documentRef = doc(db, 'chatRooms', chatId);
        const collectionRef = collection(documentRef, 'messages');
        const chatSnap = addDoc(collectionRef, {
            ...msg,
            sentBy: currentUser,
            sentTo: uid,
            createdAt: serverTimestamp(),
        });
        console.log('le messages a été envoyé et enregistré en base de données');
        setMessages(previousMessages => GiftedChat.append(previousMessages, messagesArray));
    }, []);
    
    

    //////////////////////////////////////////////////////////////////////
   /* 
    useEffect(() => {
        const chatId = uid > currentUser ? `${uid + '-' + currentUser}` : `${currentUser + '-' + uid}`;
        const documentRef = doc(db, 'chatRooms', chatId);
        const collectionRef = collection(documentRef, 'messages');
        const q = query(collectionRef);
        const docSnap = onSnapshot(q, (onSnap) => {
            const allMessages = onSnap.docs.map((mes, index) => ({
                ...mes.data(),
                _id: index.toString(), // Ajoutez une clé _id unique pour chaque message
                createdAt: mes.data().createdAt.toDate()
            }));
            setMessages(allMessages);
        });
    }, []);
    */
    /////////////////////////////////////////////////////////////////////
  
    return (
      <GiftedChat
        messages={messages}
        onSend={text => onSend(text)}
        user={{
          _id: authentication?.currentUser?.uid,
        }}
      />
    )
}

const styles = StyleSheet.create({})