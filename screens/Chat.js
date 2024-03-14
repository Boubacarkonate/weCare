import {
    StyleSheet,
    TouchableOpacity,
    Image,
    View,
    Text,
    Alert,
    Modal,
    Pressable
  } from "react-native";
  import React, {
    useState,
    useCallback,
    useEffect,
    useLayoutEffect,
  } from "react";
  import { GiftedChat, InputToolbar, Send } from "react-native-gifted-chat";
  import { authentication, db, storage } from "../firebase/firebaseConfig";
  import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    deleteDoc,
  } from "firebase/firestore";
  import { useNavigation } from "@react-navigation/native";
  import { Ionicons, FontAwesome } from "@expo/vector-icons";
  import { MaterialIcons } from '@expo/vector-icons';
  import * as ImagePicker from "expo-image-picker";
  import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
  } from "firebase/storage";

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
      const chatId =
        uid > currentUser
          ? `${uid + "-" + currentUser}`
          : `${currentUser + "-" + uid}`;
      const documentRef = doc(db, "chatRooms", chatId);
      const collectionRef = collection(documentRef, "messages");
      const q = query(collectionRef, orderBy("createdAt", "desc"));
      const docSnap = onSnapshot(q, (onSnap) => {
        const allMessages = onSnap.docs.map((mes, index) => ({
          ...mes.data(),
          _id: mes.id,
          createdAt: mes.data().createdAt.toDate(),
          image: mes.data().image, // Assurez-vous de mettre à jour l'état des messages avec l'URL de l'image
          avatar: mes.data().avatarUrl
        }));
        setMessages(allMessages);
      });
    }, []);
    
    const onSend = useCallback(
      async (messagesArray) => {
        const msg = messagesArray[0];
        const chatId =
          uid > currentUser
            ? `${uid + "-" + currentUser}`
            : `${currentUser + "-" + uid}`;
        const documentRef = doc(db, "chatRooms", chatId);
        const collectionRef = collection(documentRef, "messages");
    
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
          // image: image,
          // avatarUrl: ""
        });
    
        // Mise à jour de l'état des messages
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
  
      console.log("image sélectionnée : ", result);
      if (!result.cancelled) {
        setImage(result.assets[0].uri);
        // onSend([{ image: result.assets[0].uri }]);
        
      }
    };

//     const onSendConfirmation = () => {
//   Alert.alert(
//     "Confirmer l'envoi",
//     "Êtes-vous sûr de vouloir envoyer cette image ?",
//     [
//       { text: "Annuler", onPress: () => console.log("Annulé") },
//       { text: "Envoyer", onPress: () => onSend([{ image: image }]) },
//     ]
//   );
// };

const onSendConfirmation = () => {
  onSend([{ image: image }])
};
    
  
    const uploadImage = async () => {
      try {
        const filename = image.substring(image.lastIndexOf("/") + 1);
        const storageRef = ref(storage, `images/${filename}`);
        const response = await fetch(image);
        const blob = await response.blob();
        const uploadTask = await uploadBytes(storageRef, blob);
        window.localStorage.setItem("storageRef", uploadTask.ref.fullPath);
        const downloadURL = await getDownloadURL(uploadTask.ref);
        console.log(
          "Image téléchargée avec succès vers Firebase Storage",
          downloadURL
        );
        return downloadURL;
      } catch (error) {
        console.error(
          "Erreur lors du téléchargement de l'image vers Firebase Storage :",
          error
        );
        throw error;
      }
    };
  
    const deleteImgToStorage = async (imageUrl) => {
      try {
        const filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        const storageRef = ref(storage, `images/${filename}`);
        await deleteObject(storageRef);
        console.log("Image supprimée avec succès de Firebase Storage");
      } catch (error) {
        console.error(
          "Erreur lors de la suppression de l'image de Firebase Storage :",
          error
        );
        throw error;
      }
    };
  
    const onDeleteMessage = async (messageToDelete) => {
      try {
        const chatId =
          uid > currentUser
            ? `${uid + "-" + currentUser}`
            : `${currentUser + "-" + uid}`;
        const documentRef = doc(db, "chatRooms", chatId);
        const collectionRef = collection(documentRef, "messages");
  
        if (messageToDelete.image) {
          // Si c'est une image, supprimez l'image de Firebase Storage
          await deleteImgToStorage(messageToDelete.image);
        }
  
        // alert("confirmer la suppression");
        // Alert.alert("confirmer la suppression", [
        //   {
        //     text: "Cancel",
        //     onPress: () => console.log("Cancel Pressed"),
        //     style: "cancel",
        //   },
        //   { text: "OK", onPress: () => console.log("OK Pressed") },
        // ]);
  
        // Supprimer le message de Firestore
        await deleteDoc(doc(collectionRef, messageToDelete._id));
  
        console.log("Message supprimé avec succès:", messageToDelete._id);
  
        // Rafraîchir la liste des messages en mettant à jour l'état
        setMessages((previousMessages) =>
          previousMessages.filter(
            (message) => message._id !== messageToDelete._id
          )
        );
      } catch (error) {
        console.error("Erreur lors de la suppression du message:", error);
        // Gérer l'erreur
      }
    };

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
  
  
    const optionFile = () => {
      setModalVisible(true);
    };
  
    const closeModal = () => {
      setModalVisible(false);
    };

    const imagePreview = image ? (
      <View style={styles.imagePreviewContainer}>
        <Image source={{ uri: image }} style={styles.imagePreview} />
        <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImageButton}>
          {/* Icône de suppression ou texte, selon vos préférences */}
          <Text>Supprimer</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={onSendConfirmation}> */}
        <TouchableOpacity onPress={onSendConfirmation}>
          <Text>Envoyer</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  
    return (
      <View style={{ flex: 1 }}> {/* Assurez-vous que votre vue englobante utilise flex: 1 */}
      {imagePreview}
      <GiftedChat
        messages={messages}
        onSend={(messagesArray) => onSend(messagesArray)}
        alwaysShowSend={true}
        renderSend={itemButton}
        // renderActions={renderActions}
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
                <Lightbox>
                  <Image
                    source={{ uri: props.currentMessage.image }}
                    style={{ width: 100, height: 100 }}
                  />
                </Lightbox>
              </TouchableOpacity>
            );
          }
          return null;
        }}
        
        renderInputToolbar={props =>{
          return(
            <InputToolbar {...props}
            containerStyle={{ backgroundColor: 'green', borderRadius: 10 }}
            >
            </InputToolbar>
          );
        }}
        // renderUsernameOnMessage={true}
        // showAvatarForEveryMessage={true}
        user={{
          _id: authentication?.currentUser?.uid,
          // name: authentication?.currentUser?.displayName,
          // avatar: authentication?.currentUser?.photoURL
        }}
      />
       </View>
    );
    
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
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
    headerRightBtn: {
      flexDirection: "row",
    },

    imagePreviewContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    imagePreview: {
      width: 500, // Ajustez selon vos besoins
      height: 500, // Ajustez pour garder l'aspect ratio de votre choix
      resizeMode: 'contain', // Assure que l'image est bien ajustée
    },
    removeImageButton: {
      marginTop: 5,
      backgroundColor: 'red', // Choisissez votre couleur
      padding: 10,
      borderRadius: 5,
    },
  });



  //   const renderActions = (props) => {
  //     return (
  //       <View style={{ flexDirection: "row", alignItems: "center" }}>
  //         <Pressable onPress={optionFile}>
  //           <FontAwesome
  //             name="paperclip"
  //             size={22}
  //             color="#333"
  //             style={{
  //               marginBottom: 10,
  //               marginRight: 10,
  //               transform: [{ rotateY: "180deg" }],
  //             }}
  //           />
  //         </Pressable>

  //         {image && (
  //       <View>
  //         <Image source={{ uri: image }} style={{ width: 50, height: 50 }} />
  //         <TouchableOpacity onPress={onSend}>
  //           <Text>Ajouter une légende...</Text>
  //         </TouchableOpacity>
  //       </View>
  //     )}

  //         <Modal visible={modalVisible} animationType="fade" transparent={true}>
  //   {/* Utiliser TouchableOpacity pour détecter les touchers en dehors du contenu du modal */}
  //   <TouchableOpacity
  //     style={StyleSheet.absoluteFill}
  //     activeOpacity={1}
  //     onPressOut={closeModal} // Ferme le modal lorsque l'utilisateur touche en dehors
  //   >
  //     <View style={[styles.modalContainer, {backgroundColor: 'transparent'}]}>
  //       {/* Envelopper le contenu du modal dans une View pour empêcher la fermeture lors du toucher à l'intérieur */}
  //       <View style={styles.modalContainer}>
  //         {/* Vos boutons et contenu ici */}
  //         <TouchableOpacity style={styles.btnOptions}>
  //           <Ionicons name="document" size={35} color="black" />
  //           <Text style={styles.optionText}>Document</Text>
  //         </TouchableOpacity>
  //         <TouchableOpacity style={styles.btnOptions}>
  //           <MaterialIcons name="photo-camera" size={35} color="black" />
  //           <Text style={styles.optionText}>Caméra</Text>            
  //         </TouchableOpacity>
  //         <TouchableOpacity onPress={pickImage} style={styles.btnOptions}>
  //           <FontAwesome name="file-image-o" size={35} color="black" />
  //           <Text style={styles.optionText}>Galerie</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   </TouchableOpacity>
  // </Modal>
  
  //       </View>
  //     );
  //   };