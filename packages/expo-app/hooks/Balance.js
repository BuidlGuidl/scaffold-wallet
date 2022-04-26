import { usePoller } from "eth-hooks";
import { ethers, BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from 'use-debounce';

export default function useBalance(targetNetwork, address, pollingInterval) {
  const [balance, setBalance] = useState(BigNumber.from(0));

  const pollBalance = useDebouncedCallback(async () => {
    if (targetNetwork && address) {
      const provider = new ethers.providers.JsonRpcProvider(targetNetwork.rpcUrl);
      const newBalance = await provider.getBalance(address);
      if (newBalance._hex !== balance._hex) {
        setBalance(newBalance);
      }
    }
  }, 1000, { trailing: true });

  useEffect(() => { pollBalance() }, [targetNetwork])
  usePoller(pollBalance, pollingInterval);
  return balance;
}
