import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
const ErrorDisplay = (props) => {
  if (!props.message) return <></>;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FontAwesomeIcon
          name="warning"
          size={24}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.text}>{props.message}</Text>
      </View>
    </View>
  );
};

export default React.memo(ErrorDisplay);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    zIndex: 100,
    width: "100%",
    backgroundColor: "#fe5d83",
  },
  content: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: { fontSize: 14, color: "white", textAlign: "center" },
  icon: { padding: 10 },
});
