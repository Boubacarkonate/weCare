import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableWithoutFeedback,
  Platform,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { authentication, db } from "../firebase/firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { Button } from 'react-native-elements';

export default function Home({ navigation }) {
  const [users, setUsers] = useState([]);

  const logoutUser = async () => {
    authentication.signOut().then(() => {
      navigation.replace("Login");
    });
  };

  useEffect(() => {
    const unsubscribe = getUsers();
    return () => unsubscribe(); // Nettoyage de l'écouteur
  }, []);

  const getUsers = () => {
    const docGetUserRef = collection(db, "utilisateurs");
    const q = query(
      docGetUserRef,
      where("userUID", "!=", authentication?.currentUser?.uid)
    );
    return onSnapshot(q, (onSnap) => {
      let getdataUsers = [];
      onSnap.docs.forEach((user) => {
        getdataUsers.push({ ...user.data() });
      });
      setUsers(getdataUsers);
      console.table(getdataUsers);
    });
  };

  return (
    <>
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate("Chat", {
                name: item.username,
                uid: item.userUID,
                avatar: item.avatarUrl
              })
            }
            style={{ backgroundColor: "#333" }}
            // onPress={onPress}
          >
            <View style={styles.container}>
              <View style={styles.ownerHolder}>
                <Image source={{ uri: item.avatarUrl }} style={styles.image} />
                <Text style={styles.name}>{item.username}</Text>
                {/* <Text>{item.email}</Text> */}
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#000"
              />
            </View>
          </TouchableWithoutFeedback>
        )}
      />
      <Button title="Profile" onPress={() => navigation.navigate("Profile")} />
      <Button title="Logout" onPress={logoutUser} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 0,
    backgroundColor: "#fff",
    alignItems: "center",
    marginHorizontal: 30,
    marginVertical: 5,
    borderRadius: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginLeft: 10,
    marginVertical: 10,
  },
  ownerHolder: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 15,
    // justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 20,
    // fontFamily: Platform.OS === 'android' ? 'Lato' : "Roboto",
  },
  fonts: {
    fontSize: 18,
    fontFamily: Platform.OS === "android" ? "Lato" : "Roboto",
  },
});
