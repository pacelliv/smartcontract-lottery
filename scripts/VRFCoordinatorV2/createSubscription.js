const { vrfCoordinator_abi } = require("../../utils/abi/VRFCoordinatorV2_abi")
const { networkConfig } = require("../../helper-hardhat-config")
const { ethers } = require("hardhat")

async function createSubscription() {
    const vrfCoordinatorV2Address = networkConfig[network.config.chainId]["vrfCoordinatorV2"]
    const [signer] = await ethers.getSigners()
    const vrfCoordinatorV2Contract = new ethers.Contract(
        vrfCoordinatorV2Address,
        vrfCoordinator_abi,
        signer
    )

    console.log(
        `Creating new subscription id from VRFCoordinatorV2 at ${vrfCoordinatorV2Address} on ${network.name} network...`
    )

    const transactionResponse = await vrfCoordinatorV2Contract.createSubscription()
    const transactionReceipt = await transactionResponse.wait(1)
    const subscriptionId = transactionReceipt.events[0].args.subId
    console.log(`New Subscription Id: ${subscriptionId}`)
}

createSubscription()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
