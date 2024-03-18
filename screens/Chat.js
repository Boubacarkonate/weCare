import React, { useState, useCallback, useEffect, useLayoutEffect } from "react";
import { StyleSheet, TouchableOpacity, Image, View, Text, Modal, Pressable, TextInput , Alert} from "react-native";
import { Bubble, GiftedChat, InputToolbar, Send } from "react-native-gifted-chat";
import { authentication, db, storage } from "../firebase/firebaseConfig";
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, deleteDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as DocumentPicker from 'expo-document-picker';


import Lightbox from 'react-native-lightbox';

export default function Chat({ route }) {
    const uid = route.params.uid;
    const currentUser = authentication?.currentUser?.uid;
    const [messages, setMessages] = useState([]);
    const [image, setImage] = useState(null);
    const [documentFile, setDocumentFile] = useState(null);
    const [selectedDocumentName, setSelectedDocumentName] = useState(""); // État pour stocker le nom du document sélectionné
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
                documentFile: mes.data().documentFile,
                // avatar: mes.data().avatarUrl
            }));
            setMessages(allMessages);
        });
    }, []);

    const onSend = useCallback(
        async (messagesArray) => {
            const msg = messagesArray[0];
            const chatId = uid > currentUser ? `${uid + "-" + currentUser}` : `${currentUser + "-" + uid}`;
            const documentRef = doc(db, "chatRooms", chatId);
            const collectionRef = collection(documentRef, "messages");
    
            // Vérifiez si le message contient une image
            if (image) {
                await uploadImage();
                msg.image = image;
                setImage(null);
            }
    
            // Vérifiez si le message contient un document
            if (documentFile) {
                // Téléchargez le document vers Firebase Storage
                const downloadURL = await uploadDocumentFile(documentFile.uri, documentFile.name);
                // Ajoutez l'URL de téléchargement du document au message
                msg.documentFile = downloadURL;
                setDocumentFile(null); // Réinitialisez la variable du document sélectionné
                setSelectedDocumentName(""); // Réinitialisez le nom du document sélectionné
            }
    
            const chatSnap = await addDoc(collectionRef, {
                ...msg,
                sentBy: currentUser,
                sentTo: uid,
                createdAt: serverTimestamp(),
                image: msg.image || null,
                documentFile: msg.documentFile || null,
            });
    
            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, messagesArray)
            );
        },
        [image, documentFile]
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

    const pickDocumentFile = async () => {
        console.log('1: ouverture de la sélection');
        try {
            const result = await DocumentPicker.getDocumentAsync();
            
            if (!result.cancelled) {
                console.log('2: sélection ok', result);
                const selectedFile = result.assets[0];
                console.log(selectedFile.uri); // URI du fichier sélectionné
                console.log(selectedFile.name); // Nom du fichier
                console.log(selectedFile.size); // Taille du fichier

                // Mettre à jour le nom du document sélectionné dans l'état local
                setSelectedDocumentName(selectedFile.name);

                // Mettre à jour l'état local du document sélectionné
                setDocumentFile(selectedFile);

            } else {
                // L'utilisateur a annulé la sélection du document
                console.log('Sélection de document annulée');
                return null;
            }
            
        } catch (error) {
            // Une erreur s'est produite lors de la sélection du document
            console.error('Erreur lors de la sélection du document :', error);
            throw error;
        }
    };
    
    
    
    const uploadDocumentFile = async (documentUri, fileName) => {
        try {
            const filename = fileName || documentUri.substring(documentUri.lastIndexOf("/") + 1);
            const storageRef = ref(storage, `documents/${filename}`);
            const response = await fetch(documentUri);
            const blob = await response.blob();
            const uploadTask = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(uploadTask.ref);
            console.log("Document téléchargé avec succès vers Firebase Storage", downloadURL);
            return downloadURL;
        } catch (error) {
            console.error("Erreur lors du téléchargement du document vers Firebase Storage :", error);
            throw error;
        }
    };

 
const renderViewDocument = () => {
    if (selectedDocumentName) {
        return ( 
        <View style={styles.documentPreviewContainer}>
            <Text>Nom du document sélectionné : {selectedDocumentName}</Text>  
            </View>
);
      
    } else {
        return null;
    }
};



    

const onDeleteMessage = async (messageToDelete) => {
    try {
        const chatId = uid > currentUser ? `${uid + "-" + currentUser}` : `${currentUser + "-" + uid}`;
        const documentRef = doc(db, "chatRooms", chatId);
        const collectionRef = collection(documentRef, "messages");

        // Supprimer l'image associée si elle existe
        if (messageToDelete.image) {
            await deleteImgToStorage(messageToDelete.image);
        }

        // Supprimer le document associé si existe
        if (messageToDelete.documentFile) {
            await deleteDocumentToStorage(messageToDelete.documentFile);
        }

        // Confirmer la suppression avec une boîte de dialogue
        confirm('confirmer la suppression');
        Alert.alert(
            "Confirmation",
            "Êtes-vous sûr de vouloir supprimer ce message ?",
            [
                {
                    text: "Annuler",
                    onPress: () => console.log("Suppression annulée"),
                    style: "cancel",
                },
                {
                    text: "Supprimer",
                    onPress: async () => {
                        // Supprimer le message de la collection Firestore
                        await deleteDoc(doc(collectionRef, messageToDelete._id));
                        // Mettre à jour l'état des messages en filtrant le message supprimé
                        setMessages((previousMessages) =>
                            previousMessages.filter(
                                (message) => message._id !== messageToDelete._id
                            )
                        );
                    },
                },
            ]
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

    const deleteDocumentToStorage = async (document) => {
        try {
            const filename = document.substring(document.lastIndexOf("/") + 1);
            const storageRef = ref(storage, `documents/${filename}`);
            await deleteObject(storageRef);
            console.log("document supprimé avec succès de Firebase Storage");
        } catch (error) {
            console.error("Erreur lors de la suppression du document de Firebase Storage :", error);
            throw error;
        }
    };



    const optionFile = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const CustomAccessory = ({ onSend }) => {
        const [text, setText] = useState('');
        const [caption, setCaption] = useState('');;
    
        const handleSend = () => {
            const message = {
                text: caption, // Utiliser la légende comme texte du message
                image: text, // Utiliser l'URI de l'image comme image du message
            };
            onSend([message]); // Envoyer le message
            setText(''); // Réinitialiser l'URI de l'image après l'envoi
            setCaption(''); // Réinitialiser la légende après l'envoi
    };
    
        return (
            <View style={styles.containerCustomAccessory}>
                <TextInput
                    style={styles.inputCustomeAccessory}
                    value={caption}
                    onChangeText={setCaption}
                    placeholder="Ajouter une légende..."
                    multiline={true}
                    numberOfLines={3}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Text style={styles.sendButtonText}>Envoyer</Text>
                </TouchableOpacity>
            </View>
        );
    }; 




    const imagePreview = () => {
      if (image) {
          return (
              <View style={styles.imagePreviewContainer}>
                  <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImageButton}>
                  <Entypo name="circle-with-cross" size={24} color="black" />
                  </TouchableOpacity>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
              </View>
          );
      } else {
          return null;
      }
  };
  

    const itemButton = (props) => {
      return (
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'center'}} >
              <Pressable  onPress={() => navigation.navigate("TakeVideo_Photo_Gallery")}>
             <FontAwesome
              name="camera"
              size={22}
              color="#333"
            />
          </Pressable>
             <Pressable onPress={optionFile}>
             <FontAwesome
              name="paperclip"
              size={22}
              color="#333"
              style={{
                transform: [{ rotateY: "180deg" }],
              }}
            />
          </Pressable>
          <Send {...props}>
          <FontAwesome
              name="send-o"
              size={22}
              color="#333"
              />
          </Send>

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
          <TouchableOpacity style={styles.btnOptions} onPress={pickDocumentFile}>
            <Ionicons name="document" size={35} color="black" />
            <Text style={styles.optionText}>Document</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOptions} onPress={() => navigation.navigate("TakeVideo_Photo_Gallery")}>
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
                                <Image
                                    source={{ uri: props.currentMessage.image }}
                                    style={{ width: 100, height: 100 }}
                                />
                            </TouchableOpacity>
                        );
                    } else if (props.currentMessage.documentFile) {
                        // Extraire le nom du fichier du lien du document
                        const fileName = props.currentMessage.documentFile.split('/').pop();
                        return (
                            <TouchableOpacity
                                onLongPress={() => onDeleteMessage(props.currentMessage)}
                            >
                                <View >
                                    <Text>{fileName}</Text>
                                    {/* Afficher le nom du document */}
                                </View>
                            </TouchableOpacity>
                        );
                    }
                    return null;
                }}
                
                
                
                
                renderChatFooter={imagePreview}
                // renderChatFooter={renderViewDocument}
                renderAccessory={image || selectedDocumentName ? ({ onSend }) => <CustomAccessory onSend={onSend} /> : null}
                renderInputToolbar={props => {
                    return (
                        <InputToolbar {...props}
                            containerStyle={{ backgroundColor: 'green', borderRadius: 10 }}
                        />
                    );
                }}
                placeholder='Message please...'
                // showUserAvatar
                user={{
                    _id: authentication?.currentUser?.uid,
                    // name: authentication?.currentUser,
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

    modalContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "70%",
        backgroundColor: "red",
        // opacity: 1,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        alignContent: "center",
      },
      closeText: {
        fontSize: 16,
        marginBottom: 10,
        color: "#007BFF",
      },
      optionText: {
        fontSize: 15,
        marginBottom: 10,
      },
      btnOptions: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
      iconBackground: {
        backgroundColor: "#007BFF",
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 20,
      },

      containerCustomAccessory:{
        flex: 1,
        alignItems: "center",
        position: 'absolute',
        bottom: 10,
        backgroundColor: "blue",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      },
      inputCustomeAccessory:{
        backgroundColor: "pink"
      },
      sendButtonText:{
        backgroundColor: "yellow",
      },
      documentPreviewContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "yellow",
        width: 200,
        height: 200
    },
});

