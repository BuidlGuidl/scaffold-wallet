# 🏗 Punk Wallet React Native

> everything you need to build an Ethereum Wallet with Scaffold-Eth and React Native! 🚀

<img width="300" alt="ss1" src="https://user-images.githubusercontent.com/4507317/163157288-6eb0963e-d712-43d4-ab28-ae1f8046a342.png">
<img width="300" alt="ss2" src="https://user-images.githubusercontent.com/4507317/163157299-43c44d9d-a5e8-491e-90f0-e9ea351759a5.png">


## Overview

This repo is meant to be a open-source code base for building out Ethereum Wallets with Scaffold-Eth and React Native.

It uses an ejected Expo / RN base with minimal external dependencies. The wallet itself is intended to be minimalist, connecting to DApps with WalletConnect to sign transactions.

Currently being developed for iOS first.

# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork the repo:

```bash
git clone https://github.com/scaffold-eth/scaffold-eth-expo.git
```

> install all dependencies:

```bash
cd scaffold-eth-expo/expo-app
yarn install
```

> shim missing browser dependencies on mobile:

```bash
yarn hack
```

> install ios pods:

```bash
npx pod-install
```

> To run app on a local ios simulator:

```bash
yarn ios
```

Alternatively, to test on an iOS device (requires Apple Developer Account) open and run the project with XCode.

# 💌 P.S.

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!

# 🏃💨 Speedrun Ethereum

Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!
