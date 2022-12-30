const { vrfCoordinator_abi } = require("../../utils/abi/VRFCoordinatorV2_abi")
const { networkConfig } = require("../../helper-hardhat-config")
const { ethers } = require("hardhat")

async function cancelSubscription() {
    const vrfCoordinatorV2Address = networkConfig[network.config.chainId]["vrfCoordinatorV2"]
    const [signer] = await ethers.getSigners()
    const subscriptionId = "8066" // insert subId to cancel
    const vrfCoordinatorV2Contract = new ethers.Contract(
        vrfCoordinatorV2Address,
        vrfCoordinator_abi,
        signer
    )

    console.log(
        `Canceling subscription id ${subscriptionId} from VRFCoordinatorV2 at ${vrfCoordinatorV2Address} on ${network.name} network...`
    )

    const transactionResponse = await vrfCoordinatorV2Contract.cancelSubscription(
        subscriptionId,
        signer.address
    )

    await transactionResponse.wait(1)

    console.log(`Subscription canceled and funds sent back to ${signer.address}`)
}

cancelSubscription()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
