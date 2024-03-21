// GroupChat.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Button, Text } from 'react-native';
import { collection, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, getDocs } from 'firebase/firestore';
import { authentication, db, storage } from "../firebase/firebaseConfig";
import { useNavigation } from '@react-navigation/native';

const GroupChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupId, setGroupId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, 'utilisateurs');
      const usersSnapshot = await getDocs(usersRef);
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    };
    fetchUsers();
  }, []);

  const toggleMemberSelection = (userId) => {
    const isSelected = selectedMembers.includes(userId);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const addUsersToGroup = async (groupId, selectedMembers) => {
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        members: arrayUnion(...selectedMembers),
      });
      console.log('Utilisateurs ajoutés avec succès au groupe de chat');
    } catch (error) {
      console.error('Erreur lors de l\'ajout des utilisateurs au groupe de chat :', error);
    }
  };

  const createGroupChat = async () => {
    try {
      const groupRef = await addDoc(collection(db, 'groups'), {
        name: groupName,
        members: selectedMembers,
        createdAt: serverTimestamp(),
        id_group: '', // Champ ID temporaire
      });
      const groupId = groupRef.id;
      await updateDoc(doc(db, 'groups', groupId), { id_group: groupId }); // Mettez à jour l'id_group avec l'ID réel
      await addUsersToGroup(groupId, selectedMembers);
      setGroupId(groupId);
      console.log("Identifiant du groupe :", groupId);
      console.log("Membres du groupe : ", selectedMembers);
      console.log('nom du groupe : ', groupName);
      
      // Mettre à jour le document avec l'ID réel
      await updateDoc(doc(db, 'groups', groupId), { id_group: groupId });
      
      // Navigation vers GroupChatScreen une fois le groupe créé
      // navigation.navigate('GroupChatScreen', { groupId: groupId, selectedMembers: selectedMembers });
    } catch (error) {
      console.error('Erreur lors de la création du groupe de chat :', error);
    }
  };

  if (groupId) {
    return (
      <View>
        <Text>Groupe créé avec succès !</Text>
        {/* Vous pouvez rediriger ou afficher un message de confirmation */}
      </View>
    );
  }

  return (
    <View>
      <TextInput
        placeholder="Nom du groupe"
        value={groupName}
        onChangeText={setGroupName}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleMemberSelection(item.id)}>
            <Text>{item.username}</Text>
          </TouchableOpacity>
        )}
      />
      <Button
        title="Créer un groupe de chat"
        onPress={createGroupChat}
      />
    </View>
  );
};

export default GroupChat;
