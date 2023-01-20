import { useState, useEffect, useRef } from "react";
import Dialog from "react-native-dialog";

import {
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import {
  generateNewPrivateKeyAndWallet,
  loadAllWalletAddresses,
  saveImportedWallet,
  switchActiveWallet,
  truncateAddress,
  updateWalletAddresses,
} from "../helpers/utils";
import Blockie from "../components/Blockie";
import { ethers } from "ethers";
import AntIcon from "react-native-vector-icons/AntDesign";


export const WalletsScreen = ({ wallet, setWallet, setAddress, address, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showImport, setShowImport] = useState(false);
  const [pkToImport, setPkToImport] = useState("");
  const pkInput = useRef();

  const copyToClipboard = (key) => {
    setCopied(true);
    Clipboard.setString(key);

    setTimeout(() => setCopied(false), 1000);
  };

  const pasteToPkInput = async () => {
    const pk = await Clipboard.getString();
    setPkToImport(pk);
  };

  useEffect(() => {
    if (pkInput && pkInput.current) pkInput.current.focus();
  }, [showImport]);

  useEffect(() => {
    const loadAllAccounts = async () => {
      const walletList = await loadAllWalletAddresses();
      setWalletAddresses(walletList);
    };
    loadAllAccounts();
  }, []);

  const generateNewWallet = async () => {
    setLoading(true);
    const { generatedWallet, walletAddresses: walletList } =
      await generateNewPrivateKeyAndWallet();
    setWallet(generatedWallet);
    setAddress(generatedWallet.address);
    setWalletAddresses(walletList);
    setLoading(false);
  };

  const importWallet = async () => {
    const validPk = pkToImport.length === 66;
    if (!validPk) {
      console.log("error");
      return;
    }

    try {
      const importedWallet = new ethers.Wallet(pkToImport);
      const walletList = await saveImportedWallet(importedWallet);
      setWallet(importedWallet);
      setAddress(importedWallet.address);
      setWalletAddresses(walletList);
      setPkToImport("");
      setShowImport(false);
    } catch (err) {
      Alert.alert(
        "Error",
        "The private key is not valid",
        [{ text: "Try again" }],
        { cancelable: false }
      );
    }
  };

  const switchToWallet = async (index) => {
    console.log("switch", index, walletAddresses, walletAddresses[index]);
    const existingWallet = await switchActiveWallet(walletAddresses[index]);
    setWallet(existingWallet);
    setAddress(existingWallet.address);
    navigation.goBack();
  };

  const deleteWallet = async (index) => {
    if (walletAddresses.length < 2) return;

    const walletList = walletAddresses.filter(
      (item) => item !== walletAddresses[index]
    );
    await updateWalletAddresses(walletList);
    setWalletAddresses(walletList);

    const existingWallet = await switchActiveWallet(walletList[0]);
    setWallet(existingWallet);
    setAddress(existingWallet.address);
  };

  const toggleReveal = () => setReveal(!reveal);

  const createTwoButtonAlert = (index) =>
    Alert.alert(
      "Warning",
      `Are you sure you want to delete the account: \n${walletAddresses[index]}`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "I'm sure",
          onPress: () => deleteWallet(index),
          style: "destructive",
        },
      ]
    );
  const activeWalletIndex = walletAddresses.findIndex(
    (element) => element == address
  );

  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={() => generateNewWallet()}
          disabled={loading}
        >
          <View style={styles.mainButtons}>
            <View style={styles.icons}>
              <AntIcon name="wallet" size={40} color="#619EFD" />
              <AntIcon
                style={styles.buttonPlus}
                name="pluscircle"
                size={20}
                color="#619EFD"
              />
            </View>
            <Text style={styles.buttonText}>
              {loading ? "Generating..." : "Generate New Wallet"}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowImport(true)}
          disabled={loading}
        >
          <View style={styles.mainButtons}>
            <View style={styles.icons}>
              <AntIcon name="key" size={40} color="#619EFD" />
              <FontAwesomeIcon
                style={styles.buttonPlus}
                name="arrow-circle-down"
                size={22}
                color="#619EFD"
              />
            </View>
            <Text style={styles.buttonText}>Import Private Key</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <View style={[styles.accountCard, styles.selected]}>
          <View>
            <View style={styles.selectedAccount}>
              <Blockie address={walletAddresses[activeWalletIndex]} size={40} />
              <Text style={styles.selectedAddress}>
                {truncateAddress(walletAddresses[activeWalletIndex])}
              </Text>
              <TouchableOpacity
                onPress={() => createTwoButtonAlert(activeWalletIndex)}
                disabled={walletAddresses.length < 2}
                style={styles.positionedTrash}
              >
                <View style={styles.button}>
                  <AntIcon name="delete" size={30} color="#e70505" />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.selectedAccountOptions}>
              <View style={styles.optionButton}>
                <Button
                  title={reveal ? "Hide Private Key" : "Show Private Key"}
                  onPress={() => toggleReveal()}
                />
              </View>
            </View>
            {reveal && (
              <View style={styles.privateKeyContainer}>
                <Text style={styles.privateKey}>{wallet.privateKey}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(wallet.privateKey)}
                  style={styles.copyContainer}
                >
                  <Text style={styles.copyText}>
                    <FontAwesomeIcon color="#619EFD" name="copy" size={18} />
                    {copied ? " Copied" : " Copy"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        {walletAddresses.map((walletAddress, index) => {
          let displayAddress = truncateAddress(walletAddress);
          if (walletAddress === address) {
            return <View key={index}></View>;
          }
          return (
            <TouchableOpacity
              key={index}
              onPress={() => switchToWallet(index)}
              style={styles.unselectedAccount}
            >
              <View style={[styles.accountCard]}>
                <>
                  <Blockie address={walletAddress} size={36} />
                  <Text style={styles.address}>{displayAddress}</Text>
                </>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <Dialog.Container visible={showImport}>
        <Dialog.Title>Import Private Key</Dialog.Title>
        <Dialog.Description>
          Introduce the private key you want to import
        </Dialog.Description>
        <Dialog.Input
          textInputRef={pkInput}
          onChangeText={setPkToImport}
          value={pkToImport}
        />
        <Dialog.Button label="Cancel" onPress={() => setShowImport(false)} />
        {pkToImport.length === 0 ? (
          <Dialog.Button label="Paste" onPress={() => pasteToPkInput()} />
        ) : (
          <Dialog.Button
            label="Import"
            onPress={() => importWallet()}
            disabled={pkToImport.length != 66}
            style={pkToImport.length != 66 ? styles.disabled : ""}
          />
        )}
      </Dialog.Container>
    </ScrollView>
  );
};

var styles = StyleSheet.create({
  pageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    marginTop: 20,
    flexDirection: "row",
    height: 100,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  mainButtons: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  disabled: {
    color: "#888",
  },
  icons: {
    position: "relative",
  },
  buttonPlus: {
    position: "absolute",
    top: -6,
    right: -10,
  },
  buttonText: {
    marginTop: 2,
    width: 100,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  accountCard: {
    alignItems: "center",
    marginTop: 24,
    width: "100%",
    flexDirection: "row",
    fontSize: 24,
    backgroundColor: "#F8F8F8",
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
  selected: {
    backgroundColor: "#fff",
  },
  unselectedAccount: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContainer: {
    flexDirection: "column",
    width: "90%",
  },
  selectedAccount: {
    flexDirection: "row",
    alignItems: "center",
  },
  address: {
    marginLeft: 6,
    fontWeight: "400",
    fontSize: 16,
  },
  selectedAddress: {
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 18,
  },
  container: {
    flex: 1,
  },
  selectedAccountOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  optionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  positionedTrash: {
    position: "absolute",
    right: -20,
    top: -13,
  },
  privateKeyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  privateKey: {
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  copyText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
