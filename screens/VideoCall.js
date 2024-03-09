import React from 'react';
import { Button } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const VideoCall = () => {
  const openWebRTCApp = async () => {
    await WebBrowser.openBrowserAsync('https://boubacarkonate.github.io/appel_webrtc/');
  };

  return (
    <Button title="Open WebRTC App" onPress={openWebRTCApp} />
  );
};

export default VideoCall;

