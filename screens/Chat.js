import React, { useState, useCallback, useEffect, useLayoutEffect } from "react";
import { StyleSheet, TouchableOpacity, Image, View, Text, Modal, Pressable } from "react-native";
import { Bubble, GiftedChat, InputToolbar, Send } from "react-native-gifted-chat";
import { authentication, db, storage } from "../firebase/firebaseConfig";
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, deleteDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import ImagePreview from "./media/ImagePreview";
import Lightbox from 'react-native-lightbox';

export default function Chat({ route }) {
    const uid = route.params.uid;
    const currentUser = authentication?.currentUser?.uid;
    const [messages, setMessages] = useState([]);
    const [image, setImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={styles.headerRightBtn}>
                    <Ionicons
                        name="call"
                        size={30}
                        color="black"
                        style={{ paddingRight: 20 }}
                        onPress={() => navigation.navigate("AudioCall")}
                    />
                    <Ionicons
                        name="videocam"
                        size={30}
                        color="black"
                        style={{ paddingRight: 20 }}
                        onPress={() => navigation.navigate("VideoCall")}
                    />
                    <Ionicons
                        name="ellipsis-vertical"
                        size={30}
                        color="black"
                        onPress={() => alert("parameters")}
                    />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        const chatId = uid > currentUser ? `${uid + "-" + currentUser}` : `${currentUser + "-" + uid}`;
        const documentRef = doc(db, "chatRooms", chatId);
        const collectionRef = collection(documentRef, "messages");
        const q = query(collectionRef, orderBy("createdAt", "desc"));
        const docSnap = onSnapshot(q, (onSnap) => {
            const allMessages = onSnap.docs.map((mes, index) => ({
                ...mes.data(),
                _id: mes.id,
                createdAt: mes.data().createdAt.toDate(),
                image: mes.data().image,
                avatar: mes.data().avatarUrl
            }));
            setMessages(allMessages);
        });
    }, []);

    const onSend = useCallback(
        async (messagesArray) => {
          console.log("Messages à envoyer :", messagesArray); // Vérifiez les messages à envoyer
            const msg = messagesArray[0];
            const chatId = uid > currentUser ? `${uid + "-" + currentUser}` : `${currentUser + "-" + uid}`;
            const documentRef = doc(db, "chatRooms", chatId);
            const collectionRef = collection(documentRef, "messages");

            if (image) {
                await uploadImage();
                msg.image = image;
                setImage(null);
            }

            const chatSnap = await addDoc(collectionRef, {
                ...msg,
                sentBy: currentUser,
                sentTo: uid,
                createdAt: serverTimestamp(),
            });

            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, messagesArray)
            );
        },
        [image]
    );

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setImage(result.assets[0].uri);
            // onSend([{ image: result.assets[0].uri }]);
        }
    };

    const uploadImage = async () => {
        try {
          console.log("Image sélectionnée :", image); // Vérifier l'URI de l'image
            const filename = image.substring(image.lastIndexOf("/") + 1);
            const storageRef = ref(storage, `images/${filename}`);
            const response = await fetch(image);
            const blob = await response.blob();
            const uploadTask = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(uploadTask.ref);
            console.log("Image téléchargée avec succès vers Firebase Storage", downloadURL);
            return downloadURL;
        } catch (error) {
            console.error("Erreur lors du téléchargement de l'image vers Firebase Storage :", error);
            throw error;
        }
    };

    const onDeleteMessage = async (messageToDelete) => {
        try {
            const chatId = uid > currentUser ? `${uid + "-" + currentUser}` : `${currentUser + "-" + uid}`;
            const documentRef = doc(db, "chatRooms", chatId);
            const collectionRef = collection(documentRef, "messages");

            if (messageToDelete.image) {
                await deleteImgToStorage(messageToDelete.image);
            }
            
        confirm("confirmer la suppression");
        Alert.alert("confirmer la suppression", [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);

            await deleteDoc(doc(collectionRef, messageToDelete._id));
            setMessages((previousMessages) =>
                previousMessages.filter(
                    (message) => message._id !== messageToDelete._id
                )
            );
        } catch (error) {
            console.error("Erreur lors de la suppression du message:", error);
        }
    };

    const deleteImgToStorage = async (imageUrl) => {
        try {
            const filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            const storageRef = ref(storage, `images/${filename}`);
            await deleteObject(storageRef);
            console.log("Image supprimée avec succès de Firebase Storage");
        } catch (error) {
            console.error("Erreur lors de la suppression de l'image de Firebase Storage :", error);
            throw error;
        }
    };



    const optionFile = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const imagePreview = () => {
      if (image) {
          return (
              <View style={styles.imagePreviewContainer}>
                  <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImageButton}>
                  <Entypo name="circle-with-cross" size={24} color="black" />
                  </TouchableOpacity>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <TouchableOpacity onPress={onSendConfirmation}>
                      <Text>Envoyer</Text>
                  </TouchableOpacity>
              </View>
          );
      } else {
          return null;
      }
  };
  

  const onSendConfirmation = async () => {
    try {
        if (image) {
            const downloadURL = await uploadImage(image); // Attendre le téléchargement de l'image
            onSend([{ image: downloadURL }]); // Envoyer le message avec l'URL de l'image téléchargée
            setImage(null); // Réinitialiser l'état de l'image après l'avoir envoyée
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
    }
}



    const itemButton = (props) => {
      return (
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'center'}} >
             <Pressable onPress={optionFile}>
             <FontAwesome
              name="paperclip"
              size={22}
              color="#333"
              // style={{
              //   transform: [{ rotateY: "180deg" }],
              // }}
            />
          </Pressable>
          <Send {...props}>
          <FontAwesome
              name="send-o"
              size={22}
              color="#333"
              />
          </Send>
        
          {/* <TouchableOpacity>
          <FontAwesome name="paperclip" size={22} style={{ transform: [{ rotateY: "180deg" }]}}/>
          </TouchableOpacity> */}

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
     {/* Utiliser TouchableOpacity pour détecter les touchers en dehors du contenu du modal */}
     <TouchableOpacity
      style={StyleSheet.absoluteFill}
      activeOpacity={1}
      onPressOut={closeModal} // Ferme le modal lorsque l'utilisateur touche en dehors
    >
      <View style={[styles.modalContainer, {backgroundColor: 'transparent'}]}>
        {/* Envelopper le contenu du modal dans une View pour empêcher la fermeture lors du toucher à l'intérieur */}
        <View style={styles.modalContainer}>
          {/* Vos boutons et contenu ici */}
          <TouchableOpacity style={styles.btnOptions}>
            <Ionicons name="document" size={35} color="black" />
            <Text style={styles.optionText}>Document</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOptions}>
            <MaterialIcons name="photo-camera" size={35} color="black" />
            <Text style={styles.optionText}>Caméra</Text>            
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} style={styles.btnOptions}>
            <FontAwesome name="file-image-o" size={35} color="black" />
            <Text style={styles.optionText}>Galerie</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
        </View>
      );
    }

    const renderBubble = (props) => {
      return (
        <Bubble
            {...props}
            wrapperStyle={{
                left: {
                    backgroundColor: '#f0f0f0', // Couleur de fond pour les messages reçus
                },
                right: {
                    backgroundColor: 'red', // Couleur de fond pour les messages envoyés
                },
            }}
            textStyle={{
                left: {
                    color: '#000', // Couleur du texte pour les messages reçus
                },
                right: {
                    color: '#fff', // Couleur du texte pour les messages envoyés
                },
            }}
        />
    );
    };

    const scrollToBottomComponent = () => {
      return <FontAwesome name="angle-double-down" size={22} color="#333" />;
    };

    return (
            <GiftedChat
                messages={messages}
                onSend={(messagesArray) => onSend(messagesArray)}
                // alwaysShowSend={true}
                renderBubble={renderBubble}
                scrollToBottom
                scrollToBottomComponent={scrollToBottomComponent}
                renderSend={itemButton}
                // onPressActionButton={}   bouton + à droite
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
                                {/* <Lightbox> */}
                                    <Image
                                        source={{ uri: props.currentMessage.image }}
                                        style={{ width: 100, height: 100 }}
                                    />
                                {/* </Lightbox> */}
                            </TouchableOpacity>
                        );
                    }
                    return null;
                }}
                renderChatFooter={imagePreview}
                renderInputToolbar={props => {
                    return (
                        <InputToolbar {...props}
                            containerStyle={{ backgroundColor: 'green', borderRadius: 10 }}
                        />
                    );
                }}
                user={{
                    _id: authentication?.currentUser?.uid,
                }}
            />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imagePreviewContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        // marginBottom: 10,
    },
    imagePreview: {
        width: 500,
        height: 500,
        resizeMode: 'cover',
    },
    removeImageButton: {
        // marginTop: 5,
        backgroundColor: 'red',
        // padding: 10,
        borderRadius: 5,
    },
    headerRightBtn: {
        flexDirection: "row",
    },
});

