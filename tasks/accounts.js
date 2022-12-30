const { task } = require("hardhat/config")

task("accounts", "Prints the list of accounts provided by Hardhat").setAction(
    async (_, { ethers }) => {
        await ethers.getSigners().then((accounts) => {
            for (let i = 0; i < accounts.length; i++) {
                console.log(`Account ${i}: ${accounts[i].address}`)
            }
        })
    }
)
