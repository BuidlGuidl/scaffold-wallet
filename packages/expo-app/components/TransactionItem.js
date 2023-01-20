import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";

import { truncateAddress } from "../helpers/utils";

export const TransactionItem = ({
  openBlockExplorer,
  txn,
  handleSpeedUp,
  value,
  date,
  maxFees,
  tokenSymbol,
  targetAddress,
  isSender,
}) => {
  const isPending = handleSpeedUp != null;
  const isContract = txn.data.length > 3;

  const TransactionIcon = () => {
    if (isPending) {
      return <ActivityIndicator size="small" color="#249ff5" />;
    }
    if (isContract) {
      return <FontAwesomeIcon name="file-code-o" size={20} color="#4580eb" />;
    }
    if (isSender) {
      return <FontAwesomeIcon name="arrow-circle-o-up" size={20} color="#4580eb" />;
    }
    return (
      <FontAwesomeIcon name="arrow-circle-o-down" size={20} color="green" />
    );
  };
  return (
    <TouchableOpacity
      style={styles.completedRow}
      onPress={() => openBlockExplorer(txn.hash)}
    >
      <View style={styles.transactionIcon}>
        <TransactionIcon/>
      </View>

      <View style={styles.column}>
        {isSender && (
          <View style={styles.completedTransaction}>
            <Text style={styles.senderText}>
              Nonce:
              <Text style={styles.maxfeed}> {txn.nonce}</Text>
            </Text>
          </View>
        )}

        <View style={styles.completedTransaction}>
          <Text style={styles.senderText}>
            {isSender ? "To:" : "From:"}
            <Text style={styles.maxfeed}>
              {" "}
              {truncateAddress(targetAddress)}
            </Text>
          </Text>
        </View>
        <View style={styles.completedTransaction}>
          <Text style={styles.senderText}>
            Date:{" "}
            <Text style={styles.maxfeed}>{date.toLocaleDateString()}</Text>
          </Text>
        </View>
        <View style={styles.completedTransaction}>
          <Text style={styles.senderText}>
            Value
            <Text style={styles.maxfeed}>
              {" "}
              {parseFloat(value.toFixed(9))} {tokenSymbol}
            </Text>
          </Text>
        </View>
        {!!maxFees && (
          <View style={styles.completedTransaction}>
            <Text style={styles.senderText}>
              Max Fee: <Text style={styles.gwei}>{maxFees} Gwei</Text>
            </Text>
          </View>
        )}
      </View>

      {isPending && (
        <TouchableOpacity
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
          }}
          onPress={() => handleSpeedUp(txn.nonce)}
        >
          <Text
            style={[
              {
                textAlign: "center",
                fontSize: 12,
                fontWeight: "700",
                color: "#0E76FD",
              },
            ]}
          >
            {"Speed Up \n 20%"}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    marginTop: 24,
    width: "90%",
    flexDirection: "column",
    justifyContent: "space-between",
    fontSize: 24,
    backgroundColor: "#fff",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderRadius: 10,
  },
  transactionIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#a8a7b9",
  },
  row: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 24,
    marginTop: 20,
  },
  completedRow: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 24,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    fontSize: 24,
    marginTop: 20,
    flex: 1,
  },
  left: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  completedTransaction: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  nonce: { fontSize: 18, fontWeight: "800", color: "#888" },
  senderText: { fontSize: 14, fontWeight: "600", color: "#000" },
  maxfeed: { fontSize: 14, fontWeight: "400", color: "#888" },
  value: {
    fontSize: 14,
    fontWeight: "400",
    color: "#888",
  },
  gwei: {
    fontSize: 14,
    fontWeight: "400",
  },
  status: { fontSize: 14, fontWeight: "500", fontStyle: "italic" },
  dollarSymbol: {
    fontWeight: "300",
  },
});
