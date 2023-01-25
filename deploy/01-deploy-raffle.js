const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

    // If we're in a development chain:
    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock") // Fetch the contract's bytcode and abi from the artifact folder.
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address // Sets the address of the mock
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription() // Creates a subscription to add our contract as a consumer.
        const transactionReceipt = await transactionResponse.wait(1) // Waits 1 block confirmation for the transaction to be mined.
        subscriptionId = transactionReceipt.events[0].args.subId // Gets the subscription ID from the event emitted by the coordinator.
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT) // Fund the subscription
    } else {
        // If we're in a testnet or mainnet:
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"] // Gets the address of the coordinator from the hardhat-helper-config.
        subscriptionId = networkConfig[chainId]["subscriptionId"] // First I create a subscription ID in Chainlink Subscription Manager and then I deploy.
    }

    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]

    const arguments = [
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ]
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("--------------------------------------------------------------------")

    // If we're working in a development chain, ee need to add our smart contract to the list of
    // consumers of the Chainlink vrfCoordinator after deployment for the following reasons:
    //  - Creation of the vrfCoordinatorMock is only required for local testing, on testnet this
    //  service is automated.
    //  - Only after adding our smart contract to the list of consumers we can use requestRandomWords.
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address)
        log("Raffle.sol added as a consumer")
        log("--------------------------------------------------------------------")
    }

    if (!developmentChains.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
        await verify(raffle.address, arguments)
        log("--------------------------------------------------------------------")
    }
}

module.exports.tags = ["all", "raffle"]
