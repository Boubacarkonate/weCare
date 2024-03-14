import React, { useState } from "react";
import { Text, StyleSheet, SafeAreaView } from "react-native";
import RoomScreen from "./CallScreen";
import CallScreen from "./JoinScreen";
import JoinScreen from "./RoomScreen";

// Just to handle navigation
export default function VideoCall() {
  const screens = {
    ROOM: "JOIN_ROOM",
    CALL: "CALL",
    JOIN: "JOIN",
  };

  const [screen, setScreen] = useState(screens.ROOM);
  const [roomId, setRoomId] = useState("");

  let content;

  switch (screen) {
    case screens.ROOM:
      content = (
        <RoomScreen
          roomId={roomId}
          setRoomId={setRoomId}
          screens={screens}
          setScreen={setScreen}
        />
      );
      break;

    case screens.CALL:
      content = (
        <CallScreen roomId={roomId} screens={screens} setScreen={setScreen} />
      );
      break;

    case screens.JOIN:
      content = (
        <JoinScreen roomId={roomId} screens={screens} setScreen={setScreen} />
      );
      break;

    default:
      content = <Text>Wrong Screen</Text>;
  }

  return (
    <SafeAreaView className="flex-1 justify-center ">{content}</SafeAreaView>
  );
}