const { linkToken_abi } = require("../../utils/abi/LinkToken_abi")
const { networkConfig } = require("../../helper-hardhat-config")
const { ethers, network } = require("hardhat")

async function fundSubscription() {
    const vrfCoordinatorV2Address = networkConfig[network.config.chainId]["vrfCoordinatorV2"]
    const subscriptionId = networkConfig[network.config.chainId]["subscriptionId"]
    const linkTokenAddress = networkConfig[network.config.chainId]["linkToken"]
    const [signer] = await ethers.getSigners()
    const LinkTokenContract = new ethers.Contract(linkTokenAddress, linkToken_abi, signer)

    console.log(
        `Funding subscription id ${subscriptionId} in VRFCoordinatorV2 at ${vrfCoordinatorV2Address} on ${network.name} network...`
    )

    const transactionResponse = await LinkTokenContract.transferAndCall(
        vrfCoordinatorV2Address,
        "10000000000000000000", // 10 LINK
        ethers.utils.hexZeroPad(ethers.utils.hexlify(parseInt(subscriptionId)), 32)
    )

    await transactionResponse.wait(1)

    console.log(`Subscription funded`)
}

fundSubscription()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
