import { View, Text, Button } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const CollectablesScreen = ({ navigation }) => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Collectables screen</Text>
        <Button
          title="Go to Details"
          onPress={() => navigation.navigate('Details')}
        />
      </View>
    );
  }

const CollectablesStack = createNativeStackNavigator();

export const CollectablesStackScreen = ()=> {
  return (
    <CollectablesStack.Navigator>
      <CollectablesStack.Screen name="Collectables" component={CollectablesScreen} />
    </CollectablesStack.Navigator>
  );
}