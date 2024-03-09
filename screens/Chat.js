import { StyleSheet, TouchableOpacity, Image, View, Text } from 'react-native';
import React, { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { authentication, db, storage } from '../firebase/firebaseConfig';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export default function Chat({ route }) {
    const uid = route.params.uid;
    const currentUser = authentication?.currentUser?.uid;
    const [messages, setMessages] = useState([]);
    const [image, setImage] = useState(null);

    const navigation = useNavigation();
    
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={styles.headerRightBtn}>
                    <Ionicons name="call" size={30} color="black"  style={{ paddingRight:20 }} onPress={() => navigation.navigate("AudioCall")}  /> 
                    <Ionicons name="videocam" size={30} color="black" style={{ paddingRight:20 }} onPress={() => navigation.navigate('VideoCall')}/>
                    <Ionicons name="ellipsis-vertical" size={30} color="black" onPress={() => alert('parameters')}/>
                </TouchableOpacity>
            )
        });
    }, [navigation]);

    useEffect(() => {
        const chatId = uid > currentUser ? `${uid + '-' + currentUser}` : `${currentUser + '-' + uid}`;
        const documentRef = doc(db, 'chatRooms', chatId);
        const collectionRef = collection(documentRef, 'messages');
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
        const docSnap = onSnapshot(q, (onSnap) => {
            const allMessages = onSnap.docs.map((mes, index) => ({
                ...mes.data(),
                _id: mes.id,
                createdAt: mes.data().createdAt.toDate(),
            }));
            setMessages(allMessages);
        });
    }, []);
  
    const onSend = useCallback(async (messagesArray) => {
        const msg = messagesArray[0];
        const chatId = uid > currentUser ? `${uid + '-' + currentUser}` : `${currentUser + '-' + uid}`
        const documentRef = doc(db, 'chatRooms', chatId);
        const collectionRef = collection(documentRef, 'messages');
        
        // Vérification si une image a été sélectionnée
        if (image) {
            // Téléchargement de l'image vers Firebase Storage
            await uploadImage();
            // Ajout de l'URL de l'image téléchargée au message
            msg.image = image;
            // Réinitialisation de l'état de l'image
            setImage(null);
        }
        
        // Envoi du message à Firestore
        const chatSnap = await addDoc(collectionRef, {
            ...msg,
            sentBy: currentUser,
            sentTo: uid,
            createdAt: serverTimestamp(),
        });
        
        // Mise à jour de l'état des messages
        setMessages(previousMessages => GiftedChat.append(previousMessages, messagesArray));
    }, [image]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        console.log('image sélectionnée : ', result);
    
        if (!result.cancelled) {
          setImage(result.assets[0].uri);
        }
    };

    const uploadImage = async () => {
        try {
            const filename = image.substring(image.lastIndexOf('/') + 1);
            const storageRef = ref(storage, `images/${filename}`);
            const response = await fetch(image);
            const blob = await response.blob();
            const uploadTask = await uploadBytes(storageRef, blob);
            window.localStorage.setItem("storageRef", uploadTask.ref.fullPath);
            const downloadURL = await getDownloadURL(uploadTask.ref);
            console.log('Image téléchargée avec succès vers Firebase Storage', downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('Erreur lors du téléchargement de l\'image vers Firebase Storage :', error);
            throw error;
        }
    };

    const deleteImgToStorage = async (imageUrl) => {
        try {
            const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            const storageRef = ref(storage, `images/${filename}`);
            await deleteObject(storageRef);
            console.log('Image supprimée avec succès de Firebase Storage');
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'image de Firebase Storage :', error);
            throw error;
        }
    };

    const onDeleteMessage = async (messageToDelete) => {
        try {
            const chatId = uid > currentUser ? `${uid + '-' + currentUser}` : `${currentUser + '-' + uid}`;
            const documentRef = doc(db, 'chatRooms', chatId);
            const collectionRef = collection(documentRef, 'messages');
    
            if (messageToDelete.image) {
                // Si c'est une image, supprimez l'image de Firebase Storage
                await deleteImgToStorage(messageToDelete.image);
            }

            // Supprimer le message de Firestore
            await deleteDoc(doc(collectionRef, messageToDelete._id));
    
            console.log('Message supprimé avec succès:', messageToDelete._id);
    
            // Rafraîchir la liste des messages en mettant à jour l'état
            setMessages(previousMessages => previousMessages.filter(message => message._id !== messageToDelete._id));
    
        } catch (error) {
            console.error('Erreur lors de la suppression du message:', error);
            // Gérer l'erreur
        }
    };

    const renderActions = (props) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={pickImage}>
                    <FontAwesome 
                        name="paperclip" 
                        size={22} 
                        color="#333"  
                        style={{
                            marginBottom: 10,
                            marginRight: 10,
                            transform: [{rotateY: '180deg'}],
                        }}
                    />
                </TouchableOpacity>
            </View>
        );
    };
    

    return (
        <GiftedChat
            messages={messages}
            onSend={(messagesArray) => onSend(messagesArray)}
            renderActions={renderActions}
            renderMessageText={(props) => {
                if (props.currentMessage.text) {
                    return (
                        <TouchableOpacity
                            onLongPress={() => onDeleteMessage(props.currentMessage)}
                        >
                            <Text>{props.currentMessage.text}</Text>
                        </TouchableOpacity>
                    );
                }
                return null;
            }}
            renderMessageImage={(props) => {
                if (props.currentMessage.image) {
                    return (
                        <TouchableOpacity
                            onLongPress={() => onDeleteMessage(props.currentMessage)}
                        >
                            <Image
                                source={{ uri: props.currentMessage.image }}
                                style={{ width: 100, height: 100 }}
                            />
                        </TouchableOpacity>
                    );
                }
                return null;
            }}
            user={{
                _id: authentication?.currentUser?.uid,
            }}
        />
    );
}

const styles = StyleSheet.create({
    headerRightBtn: {
        flexDirection: 'row',
    }
});
