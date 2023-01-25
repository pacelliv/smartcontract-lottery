const { vrfCoordinator_abi } = require("../../utils/abi/VRFCoordinatorV2_abi")
const { networkConfig } = require("../../helper-hardhat-config")
const { ethers } = require("hardhat")

async function addConsumer() {
    const raffle = await ethers.getContract("Raffle")
    const subscriptionId = networkConfig[network.config.chainId]["subscriptionId"]
    const vrfCoordinatorV2Address = networkConfig[network.config.chainId]["vrfCoordinatorV2"]
    const [signer] = await ethers.getSigners()
    const vrfCoordinatorV2Contract = new ethers.Contract(
        vrfCoordinatorV2Address,
        vrfCoordinator_abi,
        signer
    )

    console.log(
        `Adding consumer ${raffle.address} to VRFCoordinatorV2 at ${vrfCoordinatorV2Address} on ${network.name} network...`
    )

    const transactionResponse = await vrfCoordinatorV2Contract.addConsumer(
        subscriptionId,
        raffle.address
    )

    await transactionResponse.wait(1)

    console.log(`Consumer added`)
}

addConsumer()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
