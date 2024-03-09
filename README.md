# weCare


                                  //AGORA.IO   VIDEO CALL

// import React, {useState} from 'react';
// import AgoraUIKit from 'agora-rn-uikit';
// import Ionicons from '@expo/vector-icons/Ionicons';

// const App = () => {
//   const [videoCall, setVideoCall] = useState(true);
//   const connectionData = {
//     appId: '351b7329d91b4cc6a7648a829b9d3099',
//     channel: 'test',
//   };
//   const rtcCallbacks = {
//     EndCall: () => setVideoCall(false),
//   };
//   return videoCall ? (
//     <AgoraUIKit connectionData={connectionData} rtcCallbacks={rtcCallbacks} />
//   ) : (
//     <Text onPress={()=>setVideoCall(true)}>Start Call</Text>
//   );
// };

// export default App;



                                    //AGORA.IO   VOICE CALLING 1

// import React, { useRef, useState, useEffect } from 'react';
// import { SafeAreaView, ScrollView, StyleSheet, Text, View, PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
// import { ClientRoleType, createAgoraRtcEngine, ChannelProfileType } from 'react-native-agora';
// import { Ionicons } from '@expo/vector-icons';

// const appId = '351b7329d91b4cc6a7648a829b9d3099'; // Votre App ID
// const channelName = 'test audio'; // Nom du canal
// const uid = 0; // ID utilisateur, 0 pour laisser Agora l'assigner

// const App = () => {
//     const agoraEngineRef = useRef(createAgoraRtcEngine()); // Création de l'instance Agora engine
//     const [isJoined, setIsJoined] = useState(false); // Indique si l'utilisateur local a rejoint le canal
//     const [remoteUid, setRemoteUid] = useState(null); // Uid de l'utilisateur distant
//     const [message, setMessage] = useState(''); // Message à l'utilisateur

//     useEffect(() => {
//         const initAgoraEngine = async () => {
//             if (Platform.OS === 'android') {
//                 await PermissionsAndroid.requestMultiple([
//                     PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//                     PermissionsAndroid.PERMISSIONS.CAMERA,
//                 ]);
//             }
//             agoraEngineRef.current.initialize({appId: appId});
//             agoraEngineRef.current.enableVideo();
//             agoraEngineRef.current.setChannelProfile(ChannelProfileType.LiveBroadcasting);
//             agoraEngineRef.current.setClientRole(ClientRoleType.Broadcaster);

//             agoraEngineRef.current.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
//                 setIsJoined(true);
//                 showMessage(`Join channel success: ${channel}, uid: ${uid}`);
//             });

//             agoraEngineRef.current.addListener('UserJoined', (uid, elapsed) => {
//                 setRemoteUid(uid);
//                 showMessage(`Remote user joined: ${uid}`);
//             });

//             agoraEngineRef.current.addListener('UserOffline', (uid, reason) => {
//                 setRemoteUid(null);
//                 showMessage(`Remote user left: ${uid}`);
//             });
//         };

//         initAgoraEngine();

//         return () => {
//             agoraEngineRef.current?.destroy();
//         };
//     }, []);

//     const join = async () => {
//         await agoraEngineRef.current.joinChannel(channelName, null, uid);
//         console.log("appel en cours");
//     };

//     const leave = async () => {
//         await agoraEngineRef.current.leaveChannel();
//         setIsJoined(false);
//         setRemoteUid(null);
//         console.log("fin d'appel");
        
//     };

//     const showMessage = (msg) => {
//         setMessage(msg);
//     };

//     return (
//         <SafeAreaView style={styles.main}>
//             <Text style={styles.head}>Agora Video Calling Quickstart</Text>
//             <View style={styles.btnContainer}>
//                 <TouchableOpacity onPress={join}>
//                         <Ionicons name="call" size={32} color="green"  />
//                 </TouchableOpacity>
                
//                 <TouchableOpacity onPress={leave}>
//                         <Ionicons name="call" size={32} color="red"  />
//                 </TouchableOpacity>
                
                    
//             </View>
//             <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContainer}>
//                 {isJoined ? (
//                     <Text>Local user uid: {uid}</Text>
//                 ) : (
//                     <Text>Join a channel</Text>
//                 )}
//                 {isJoined && remoteUid !== null ? (
//                     <Text>Remote user uid: {remoteUid}</Text>
//                 ) : (
//                     <Text>Waiting for a remote user to join</Text>
//                 )}
//                 <Text>{message}</Text>
//             </ScrollView>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     button: {
//         paddingHorizontal: 25,
//         paddingVertical: 10,
//         fontWeight: 'bold',
//         color: '#ffffff',
//         backgroundColor: '#0055cc',
//         margin: 5,
//     },
//     main: { flex: 1, alignItems: 'center' },
//     scroll: { flex: 1, backgroundColor: '#ddeeff', width: '100%' },
//     scrollContainer: { alignItems: 'center' },
//     btnContainer: { flexDirection: 'row', justifyContent: 'center' },
//     head: { fontSize: 20, marginVertical: 20 },
// });

// export default App;






                                    //AGORA.IO   VOICE CALLING 2

import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  ChannelProfileType,
} from 'react-native-agora';
import { MaterialIcons } from '@expo/vector-icons';


const appId = '351b7329d91b4cc6a7648a829b9d3099';
const channelName = 'dhruvicalling';
// const token = 'Yourtoken';
const uid = 0;

const App = () => {
  const agoraEngineRef = useRef(); // Agora engine instance, removed type annotation
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Initialize Agora engine when the app starts
    setupVoiceSDKEngine();
  }, []);

  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngineRef.current?.joinChannel(channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      console.log('appel en cours');
    } catch (e) {
      console.log(e);
    }
  };

  const setupVoiceSDKEngine = async () => {
    try {
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user joined with uid ' + Uid);
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setRemoteUid(0);
        },
      });
      agoraEngine.initialize({
        appId: appId,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage('You left the channel');
      console.log('fin appel');
    } catch (e) {
      console.log(e);
    }
  };

  function showMessage(msg) {
    setMessage(msg);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Calling App</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={join} style={styles.joinButton}>
        <MaterialIcons name="call" size={32} color="white"  />
        </TouchableOpacity>
        <TouchableOpacity onPress={leave} style={styles.leaveButton}>
        <MaterialIcons name="call-end" size={32} color="white"  />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContainer}>
        {isJoined ? (
          <Text style={styles.infoText}>Local user uid: {uid}</Text>
        ) : (
          <Text style={styles.infoText}>Join a channel</Text>
        )}
        {isJoined && remoteUid !== 0 ? (
          <Text style={styles.infoText}>Remote user uid: {remoteUid}</Text>
        ) : (
          <Text style={styles.infoText}>Waiting for a remote user to join</Text>
        )}
        <Text style={styles.messageText}>{message}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    joinButton: {
        paddingHorizontal: 25,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
        margin: 5,
    },
    leaveButton: {
        paddingHorizontal: 25,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#E57373',
        margin: 5,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    scroll: {
        flex: 1,
        backgroundColor: '#ffffff',
        width: '90%',
        padding: 10,
        borderRadius: 8,
    },
    scrollContainer: {
        alignItems: 'center',
    },
    infoText: {
        fontSize: 18,
        marginVertical: 10,
    },
    messageText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#555555',
    },
});

const getPermission = async () => {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
  }
};

export default App;

