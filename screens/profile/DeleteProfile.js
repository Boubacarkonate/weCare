/*                                                  SUPPRESSSION DU DOCUMENT COMPORTANT 
                                                    DE L4UTULISATEUR. CEPENDANT, IL EST TOUJOURS DANS LA BDD

*/
// // Importez les modules nécessaires depuis React et react-native
// import React, { useState } from 'react';
// import { StyleSheet, View, Button, Alert, Modal, Text, TouchableOpacity } from 'react-native';
// import { authentication, db } from '../..//firebase/firebaseConfig'; // Importez la fonction de suppression de l'utilisateur
// import { useNavigation } from '@react-navigation/native';
// import { deleteDoc, doc } from 'firebase/firestore';

// // Définissez votre composant DeleteProfile
// export default function DeleteProfile() {
//     const navigation = useNavigation();
//     const [modalVisible, setModalVisible] = useState(false);

//     // Définissez la fonction pour supprimer le profil de l'utilisateur
//     const handleDeleteProfile = async () => {
//         try {
//             const userDocRef = doc(db, 'utilisateurs', authentication.currentUser.uid);
//             await deleteDoc(userDocRef); // Supprimer le document utilisateur
//             console.log('User profile deleted successfully');
//             // Afficher une alerte de suppression réussie
//             Alert.alert('Success', 'Profile supprimé');
//             // Rediriger automatiquement vers la page d'accueil après la suppression
//             navigation.navigate('Register');
//         } catch (error) {
//             console.error('Error deleting user profile:', error);
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <Button
//                 onPress={() => setModalVisible(true)}
//                 title='Delete Profile'
//             />
//             {/* Modal pour la confirmation */}
//             <Modal
//                 animationType='slide'
//                 transparent={true}
//                 visible={modalVisible}
//                 onRequestClose={() => {
//                     setModalVisible(!modalVisible);
//                 }}>
//                 <View style={styles.modalContainer}>
//                     <View style={styles.modalContent}>
//                         <Text style={styles.modalText}>Are you sure you want to delete your profile?</Text>
//                         <TouchableOpacity
//                             style={styles.modalButton}
//                             onPress={() => {
//                                 setModalVisible(!modalVisible);
//                                 handleDeleteProfile();
//                             }}>
//                             <Text style={styles.modalButtonText}>Confirm</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                             style={[styles.modalButton, styles.cancelButton]}
//                             onPress={() => {
//                                 setModalVisible(!modalVisible);
//                             }}>
//                             <Text style={styles.modalButtonText}>Cancel</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </Modal>
//         </View>
//     );
// }

// // Définissez les styles CSS pour votre composant
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     modalContainer: {
//         flex: 1,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     modalContent: {
//         backgroundColor: '#fff',
//         padding: 20,
//         borderRadius: 10,
//         elevation: 5,
//     },
//     modalText: {
//         marginBottom: 20,
//         fontSize: 18,
//         textAlign: 'center',
//     },
//     modalButton: {
//         backgroundColor: 'blue',
//         padding: 10,
//         borderRadius: 5,
//         marginBottom: 10,
//     },
//     modalButtonText: {
//         color: '#fff',
//         textAlign: 'center',
//         fontSize: 16,
//     },
//     cancelButton: {
//         backgroundColor: 'red',
//     },
// });

/*                                                  SUPPRESSSION DE L'UTILISATEUR EN BDD 
                                                    CEPENDANT, SES DOCUMENTS ANTERIEURS SONT TOUJOURS ENREGISTRES

*/

import React, { useState } from 'react';
import { StyleSheet, View, Button, Alert, Modal, Text, TouchableOpacity } from 'react-native';
import { authentication, db } from '../../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { deleteDoc, doc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

export default function DeleteProfile() {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);

    const handleDeleteAccount = async () => {
        try {
            await deleteUser(authentication.currentUser);
            // Rediriger l'utilisateur vers la page de connexion ou afficher un message de confirmation
            navigation.navigate('Register');
        } catch (error) {
            console.error('Error deleting account:', error);
            // Afficher un message d'erreur à l'utilisateur
            Alert.alert('Error', 'An error occurred while deleting your account.');
        }
    };

    return (
        <View style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Are you sure you want to delete your account?</Text>
                        <TouchableOpacity
                            style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                            onPress={() => {
                                handleDeleteAccount();
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <Text style={styles.textStyle}>Yes, delete my account</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ ...styles.openButton, backgroundColor: "#2196F3", marginTop: 10 }}
                            onPress={() => {
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <Text style={styles.textStyle}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Button title="Delete Account" onPress={() => setModalVisible(true)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    openButton: {
        backgroundColor: '#F194FF',
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

