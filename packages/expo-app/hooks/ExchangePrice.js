import { Fetcher, Route, Token, WETH } from "@uniswap/sdk";
import { useOnRepetition } from "eth-hooks";
import { useCallback, useState } from "react";

export default function useExchangePrice(targetNetwork, mainnetProvider, pollTime = 0) {
  const [price, setPrice] = useState(0);
  const pollPrice = useCallback(() => {
    const getPrice = async () => {
      if (!mainnetProvider) {
        return;
      }
      else if (targetNetwork.price) {
        setPrice(targetNetwork.price);
      }
      else {
        const network = await mainnetProvider.getNetwork();
        const DAI = new Token(network ? network.chainId : 1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18);
        const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId], mainnetProvider);
        const route = new Route([pair], WETH[DAI.chainId]);

        const priceOfETHinDAI = parseFloat(route.midPrice.toSignificant(6));

        // setPrice(priceOfETHinDAI);
        if (targetNetwork.nativeCurrency && targetNetwork.nativeCurrency.uniswap) {
          let contractAddress = targetNetwork.nativeCurrency.uniswap
          const TOKEN = new Token(mainnetProvider.network ? mainnetProvider.network.chainId : 1, contractAddress, 18);
          const pair = await Fetcher.fetchPairData(WETH[TOKEN.chainId], TOKEN, mainnetProvider);
          const route = new Route([pair], TOKEN);
          const price = parseFloat(route.midPrice.toSignificant(6) * priceOfETHinDAI);
          setPrice(price);
        } else {
          setPrice(priceOfETHinDAI);
        }
      }
    };
    void getPrice();
  }, [targetNetwork.price, mainnetProvider]);
  useOnRepetition(pollPrice, { pollTime, provider: mainnetProvider });
  return price;
};

