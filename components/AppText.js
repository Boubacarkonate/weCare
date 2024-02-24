import { Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function AppText({inputText, stylesLing, onPress, placeholder, numberOfLines}) {
  return (
   
      <Text style={[styles.fonts, stylesLing]} onPress={onPress} numberOfLines={numberOfLines}>{inputText}</Text>
    
  )
}

const styles = StyleSheet.create({
    fonts: {
        fontSize: 18,
        fontFamily: Platform.OS === 'android' ? 'Lato' : "Roboto",
    }
})