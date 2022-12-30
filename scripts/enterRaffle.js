const { ethers } = require("hardhat")

async function enterRaffle() {
    const raffle = await ethers.getContract("Raffle")
    console.log(`Got Raffle contract at ${raffle.address}`)
    const entranceFee = await raffle.getEntranceFee()
    const tx = await raffle.enterRaffle({ value: entranceFee + 1 }) // add extra ETH to cover for gas fees
    await tx.wait(1)
    console.log("You have entered the raffle, Good luck!")
}

enterRaffle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
