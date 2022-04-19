import axios from "axios";
import { usePoller } from "eth-hooks";
import { useEffect, useState } from "react";
import { ETHERSCAN_KEY, NETWORKS } from "../constants";
import { ethers } from "ethers";

export default function useGasPrice(targetNetwork, localProvider, pollingInterval) {
  const [gasPrice, setGasPrice] = useState();

  const loadGasPrice = async () => {
    // Use Etherscan for Mainnet gas estimation
    if (targetNetwork.name === NETWORKS.ethereum.name) {
      axios
        .get("https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" + ETHERSCAN_KEY)
        .then(response => {
          const newGasPrice = ethers.utils.parseUnits(response.data.result["SafeGasPrice"], "gwei")
          if (newGasPrice !== gasPrice) {
            setGasPrice(newGasPrice);
          }
        })
        .catch(error => console.log(error));
    }
    // For all others chains / testnets use ethers gasPrice estimation
    else if (localProvider) {
      {
        localProvider
          .getGasPrice()
          .then(newGasPrice => {
            if (newGasPrice !== gasPrice) {
              setGasPrice(newGasPrice);
            }
          })
      }
    } else if (targetNetwork.gasPrice) {
      setGasPrice(targetNetwork.gasPrice);
    }
  };

  useEffect(() => { loadGasPrice() }, [localProvider])
  usePoller(loadGasPrice, pollingInterval);
  return gasPrice;
}
