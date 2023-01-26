const networkConfig = {
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        entranceFee: "10000000000000000", // 0.01 ETH
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", //30 gwei
        subscriptionId: "4622",
        callbackGasLimit: "500000", // 500,000 gas
        interval: "30",
    },
    31337: {
        name: "localhost",
        entranceFee: "10000000000000000", // 0.01 ETH
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000", // 500,000 gas
        interval: "30",
    },
    80001: {
        name: "polygonMumbai",
        vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
        linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        entranceFee: "100000000000000000", // 0.1 MATIC
        gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f", // 500 gwei
        subscriptionId: "3133",
        callbackGasLimit: "500000",
        interval: "30",
    },
}

const developmentChains = ["hardhat", "localhost"]
const FRONTEND_ADDRESSES_FILE =
    "../../frontend-apps/raffle-frontend/constants/contractAddresses.json"
const FRONTEND_ABI_FILE = "../../frontend-apps/raffle-frontend/constants/abi.json"

module.exports = {
    networkConfig,
    developmentChains,
    FRONTEND_ABI_FILE,
    FRONTEND_ADDRESSES_FILE,
}
