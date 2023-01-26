<div align = "center">
    <img src="/images/banner.png">
</div>

### ⚡️⚡️ Live Demo: https://plain-flower-7694.on.fleek.co/

### ⚡️⚡️ ipfs://QmSSgn6s6yp8Zxy4Fv9AustXvVNV1MBQ6SJpHdx5Y349B1

## Overview

Blockchains are highly secure and reliable systems because of a few specific design principles. To reach consensus Blockchains only need to answer a series of binary questions using data that's already stored in its own legder. The ledger of a blockchain is deemed to be true because it leverages decentralization by redundantly validating every piece of data by every node in the network. This way of verifying data and reaching consensus is what give blockchains their determistic and untamperable properties.

Blockchains are not well suited to deal with subjectivity or randomness, in order to deal with situations or data that involve the aformentioned points, blockchains need oracles like Chainlink. An Oracle is an entity that connect blockchain to any external system and provides to blockchains two main services:

-   Connect blockchains with any off-chain system to send and receive data.
-   Provide external computation that cannot be executed on-chain (e.g. generate random numbers).

This project implements Chainlink's VRF v2 and Chainlink Automation to create a decentralized, verifiably and autonomous smart contract lottery.

## Getting Started

To run this repo you need to install the following packages:

-   [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
    -   After installing the package run in the terminal the command `git --version` and if the installation was successful the output should look like this: `git version x.xx.x`
-   [Nodejs](https://nodejs.org/en/)
    -   In the terminal run the command `node --version`, if the output looks like `vxx.xx.x` that means the package was installed.
-   [Yarn](https://nodejs.org/en/)
    -   Instead of `npm` install `yarn`. In the terminal run the command `yarn --version`, if the output looks like `x.xx.xx` that means the package was installed.

## Quickstart

Clone this repo, cd into the folder and and run `yarn` to install the dependencies.

```
git clone https://github.com/PacelliV/hardhat-fund-me.git
cd hardhat-fund-me
yarn
```

## Test Locally

### Compile

Compile the lottery, mocks and inherited contract with:

```
yarn hardhat compile
```

### Deploy

Deploy to Hardhat built-in network the lottery and the mock of the VRFCoordinatorV2.

```
yarn hardhat deploy
```

### Test

This project provides a comprehensive and extensive unit test against the contract to demostrate the entire workflow and the logic on working with: (a) Chainlink Automation for automating the contract with an upKeep and (b) making a request to the VRF Service in order to get a random number.

```
yarn hardhat test
```

### Coverage

This contract has a coverage of over 97% of the functions.

```
yarn hardhat coverage
```

## Deployment to a testnet

1. Set up environment variables:

You'll need to set your `RPC_URL_GOERLI` and `PRIVATE_KEY` as enviroment variables. Yo can add them to an `.env` file.

-   `PRIVATE_KEY`: The private key of your account (e.g. from [Metamask](https://metamask.io/)). <b>NOTE: IT IS RECOMMENDED TO CREATE A NEW ACCOUNT FOR TESTING PURPOSES AND NEVER USE AN ACCOUNT WITH REAL FUNDS.</b>
    -   You can learn how to export a private key [here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key).
-   `RPC_URL_GOERLI`: I'ts the url of the goerli node you are working with. You can set up one for free in [Alchemy](https://www.alchemy.com/).

2. Get test ETH and LINK

Go to https://goerlifaucet.com/ or [faucets.chain.link](https://faucets.chain.link/) to get test ETH and LINK in your Metamask.

Once you've requested for LINK tokens, this are not visible by default on Metamask, in order to see the balance of this token you'll need to import it. [Read more about how to set up your wallet with LINK](https://docs.chain.link/resources/acquire-link/).

3. Setup a Chainlink VRF Subscription ID

The VRF Service only provide random numbers to contracts that are added as consumers under a subscription ID to the Coordinator. Head over to [vrf.chain.link](https://vrf.chain.link/), create a new subscription and fund it with at leat 10 LINK. You can reuse an old subscription if you already have one.

You can [read more](https://docs.chain.link/docs/vrf/v2/subscription/examples/get-a-random-number/) in case that you need more information on how to create the Chainlink VRF Subscription ID.

At this this step you should have:

1.  Subscription ID.
2.  Your subscription should be funded with LINK.

In your `helper-hardhat-config.js` add your `subscriptionId` under the section of the chainId you will deploy your contract. If you're deploying to goerli, add your `subscriptionId` in the `subscriptionId` field under the `5` section.

Now deploy the contract:

```
yarn hardhat deploy --network goerli
```

Advice: store your contract address for a quick access in case it's needed or find it in [Goerli Tesnet Explorer](https://goerli.etherscan.io/).

4. Add your contract address as a Chainlink VRF Consumer

Go back to [vrf.chain.link](https://vrf.chain.link/), under your subscription click on `Add consumer` and insert your contract address.

5. Register to Chainlink Automation

The process of kicking off a VRF Request is automated with Chainlink Automation. In order for Chainlink Nodes to be checking for our contract to know if they have to call `performUpkeep` we need to create a upkeep.

[Read more to find extra information](https://docs.chain.link/docs/chainlink-automation/compatible-contracts/)

Go to [automation.chain.link](https://automation.chain.link/) and register a new upkeep. Choose `Custom logic` as the trigger mechanism for the upkeep and insert your `contract address`. Your UI will look something like this once completed:

<div align = "center">
    <img src="/images/CapturaKeepers.JPG">
    <p>Screenshot. The optional fields can be left blank.</p>
</div>

## Enter your Raffle and get a winner

Your contract is now setup to be a tamper proof autonomous, verifiably random lottery.

Let's run your lottery locally and on goerli testnet.

### Using localhost

Duplicate your terminal an launch your local blockchain by running:

```
yarn hardhat node
```

Now enter your lottery:

```
yarn hardhat run scripts/enter.js --network localhost
```

Find a winner by running:

```
yarn hardhat run scripts/mockOffChain.js --network localhost
```

### Using goerli testnet

You contract is deployed and added as consumer to the VRF Service and it's been listen by Chainlink Automation. To test your contract on goerli run:

```
yarn hardhat test --network goerli
```

It will take some time to complete the test, but after it is completed head over to goerli etherscan and you will see that you enter the raffle, and in the internal transactions tab you will see the calling of `checkUpkeep` and `performUpkeep`.

## Estimate gas cost in USD

To get an USD estimation of gas cost, you'll need a `COINMARKETCAP_API_KEY` environment variable. You can get one for free from [CoinMarketCap](https://pro.coinmarketcap.com/account).

Then, uncomment the line coinmarketcap: `COINMARKETCAP_API_KEY`, in `hardhat.config.js` to get the USD estimation. Just note, everytime you run your tests it will use an API call, so it might make sense to have using coinmarketcap disabled until you need it. You can disable it by just commenting the line back out.

## Verify on Etherscan

If you deploy to a testnet or mainnet, you can verify it if you get an [API Key](https://etherscan.io/login?cmd=last) from Etherscan and set it as an environemnt variable named `ETHERSCAN_API_KEY`. You can pop it into your `.env` file as seen in the `.env.example`.

However, you can manual verify with:

```
yarn hardhat verify <DEPLOYED_CONTRACT_ADDRESS> --constructor-args
```

In it's current state, if you have your api key set, it will auto verify goerli contracts.

## Typescript

There's no typescript version of this repo, but PRs are welcome!

## Linting

To check linting / code formatting:

```
yarn lint
```

or, to fix:

```
yarn lint:fix
```

## Acknowledgements

I want to thanks [PatrickAlphaC](https://github.com/PatrickAlphaC) for teaching me the necessary tools to complete this project in my journey to become a full stack developer.

## Thank you

I hope you like this project and it ends up being useful to you. 👨‍💻🎉 🎉
