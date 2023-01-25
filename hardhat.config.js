require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("./tasks")
require("dotenv").config()

// RPC URLs
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli.g.alchemy.com/v2/apiKey"
const MUMBAI_RPC_URL =
    process.env.MUMBAI_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/apiKey"

// Private keys
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || "0x"
const MUMBAI_PRIVATE_KEY = process.env.MUMBAI_PRIVATE_KEY || "0x"

// Other keys
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Your etherscan API key"
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "You polygon API key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "Your CoinmarketCap API Key"

// General
const REPORT_GAS = process.env.REPORT_GAS || false

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.6",
            },
        ],
    },

    defaultNetwork: "hardhat",

    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        localhost: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        goerli: {
            chainId: 5,
            blockConfirmations: 6,
            url: GOERLI_RPC_URL,
            accounts: GOERLI_PRIVATE_KEY !== undefined ? [GOERLI_PRIVATE_KEY] : [],
        },
        polygonMumbai: {
            chainId: 80001,
            blockConfirmations: 6,
            url: MUMBAI_RPC_URL,
            accounts: MUMBAI_PRIVATE_KEY !== undefined ? [MUMBAI_PRIVATE_KEY] : [],
        },
    },

    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
            polygonMumbai: POLYGONSCAN_API_KEY,
        },
        // Uncomment in case of "customChains not iterable" error during contract verification
        customChains: [
            {
                network: "goerli",
                chainId: 5,
                urls: {
                    apiURL: "https://api-goerli.etherscan.io/api",
                    browserURL: "https://goerli.etherscan.io/",
                },
            },
            // {
            //     network: "polygonMumbai",
            //     chainId: 80001,
            //     url: {
            //         apiURL: "https://api-testnet.polygonscan.com/",
            //         browserURL: "https://mumbai.polygonscan.com/",
            //     },
            // },
        ],
    },

    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        // token: "MATIC",
    },

    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },

    mocha: {
        timeout: 500000,
    },
}
