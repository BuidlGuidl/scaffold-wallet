import axios from "axios";
import { usePoller } from "eth-hooks";
import { useCallback, useEffect, useState } from "react";
import { ETHERSCAN_KEY, NETWORKS } from "../constants";
import { ethers } from "ethers";
import { useDebouncedCallback } from 'use-debounce';

export default function useGasPrice(targetNetwork, pollingInterval) {
  const [gasPrice, setGasPrice] = useState();

  const loadGasPrice = useDebouncedCallback(async () => {
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
    else if (targetNetwork.rpcUrl) {
      const provider = new ethers.providers.JsonRpcProvider(targetNetwork.rpcUrl);
      const newGasPrice = await provider.getGasPrice()
      if (newGasPrice !== gasPrice) {
        setGasPrice(newGasPrice);
      }
    } else if (targetNetwork.gasPrice) {
      setGasPrice(targetNetwork.gasPrice);
    }
  }, 1000, { trailing: true });

  useEffect(() => { loadGasPrice() }, [targetNetwork])
  usePoller(loadGasPrice, pollingInterval);
  return gasPrice;
}
