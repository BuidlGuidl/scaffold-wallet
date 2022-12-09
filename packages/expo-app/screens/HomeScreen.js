import { View, Text, Button, Image, TouchableHighlight } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FloatingButton } from "../components/FloatingButton";
import AntIcon from "react-native-vector-icons/AntDesign";

const ScaffoldEthWalletLogo = require("../assets/scaffoldEthWalletLogo.png");

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate("Details")}
      />
    </View>
  );
};

const HomeStack = createNativeStackNavigator();

export const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation, route }) => ({
          headerLeft: (props) => (
            <Image
              style={{ width: 30, height: 30, borderRadius: 50 }}
              source={ScaffoldEthWalletLogo}
            />
          ),
          headerTitle: "",
          // Add a placeholder button without the `onPress` to avoid flicker
          headerRight: () => (
            <TouchableHighlight onPress={() => {}}>
              <View>
                <AntIcon name="scan1" size={30} color="#619EFD" />
              </View>
            </TouchableHighlight>
          ),
        })}
      />
    </HomeStack.Navigator>
  );
};
