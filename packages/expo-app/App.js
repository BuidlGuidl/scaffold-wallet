import * as React from 'react';
import { Button, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CollectablesStackScreen } from './screens/CollectablesScreen';
import { HomeStackScreen } from './screens/HomeScreen';


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <HomeStackScreen/>
    </NavigationContainer>
  //   <NavigationContainer>
  //   <HomeStackScreen/>
  //   <Tab.Navigator screenOptions={{ headerShown: false }}>
  //     <Tab.Screen name="HomeTab" component={HomeStackScreen} />
  //     <Tab.Screen name="CollectablesTab" component={CollectablesStackScreen} />
  //   </Tab.Navigator>
  // </NavigationContainer>
  );
}