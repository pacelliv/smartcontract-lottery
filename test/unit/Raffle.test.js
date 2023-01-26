const { assert, expect } = require("chai")

const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Test", async () => {
          let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
          const chainId = network.config.chainId

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })

          //           describe("constructor", async () => {
          //               it("initialized the raffle correctly", async () => {
          //                   // Ideally we make our test have just 1 assert per it

          //                   const raffleState = await raffle.getRaffleState()
          //                   const interval = await raffle.getInterval()
          //                   assert.equal(raffleState.toString(), "0")
          //                   assert.equal(interval.toString(), networkConfig[chainId]["interval"])
          //               })
          //           })

          //           describe("enterRaffle", async () => {
          //               it("revert when you don't pay enough", async () => {
          //                   await expect(raffle.enterRaffle()).to.be.revertedWith(
          //                       "Raffle_NotEnoughEthEntered"
          //                   )
          //               })
          //               it("records players when they enter", async () => {
          //                   await raffle.enterRaffle({
          //                       value: raffleEntranceFee,
          //                   })

          //                   const playerFromContract = await raffle.getPlayer(0)
          //                   assert.equal(playerFromContract, deployer)
          //               })
          //               it("emits event on enter", async () => {
          //                   await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
          //                       raffle,
          //                       "RaffleEnter"
          //                   )
          //               })

          //               it("doesn't allow entrance when raffle is calculating", async () => {
          //                   await raffle.enterRaffle({ value: raffleEntranceFee })
          //                   await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          //                   await network.provider.request({
          //                       method: "evm_mine",
          //                       params: [],
          //                   })

          //                   // We pretend to be a Chainlink Keeper
          //                   await raffle.performUpkeep([])
          //                   await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith(
          //                       "Raffle__NOTOPEN"
          //                   )
          //               })
          //           })
          //           describe("checkUpKeep", async () => {
          //               it("returns false if people haven't sent any ETH", async () => {
          //                   await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          //                   await network.provider.request({
          //                       method: "evm_mine",
          //                       params: [],
          //                   })
          //                   const { upkeepNeeded } = await raffle.checkUpkeep([])
          //                   assert(!upkeepNeeded)
          //               })
          //               it("returns false if raffle isn't open", async () => {
          //                   await raffle.enterRaffle({ value: raffleEntranceFee })
          //                   await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          //                   await network.provider.request({
          //                       method: "evm_mine",
          //                       params: [],
          //                   })
          //                   await raffle.performUpkeep([])
          //                   const raffleState = await raffle.getRaffleState()
          //                   const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          //                   assert.equal(raffleState.toString(), "1", upkeepNeeded == false)
          //                   //   assert.equal(upkeepNeeded, false)
          //               })
          //               it("returns false if enough time hasn't passed", async () => {
          //                   await raffle.enterRaffle({ value: raffleEntranceFee })
          //                   await network.provider.send("evm_increaseTime", [interval.toNumber() - 1])
          //                   await network.provider.request({
          //                       method: "evm_mine",
          //                       params: [],
          //                   })
          //                   const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
          //                   assert(!upkeepNeeded)
          //               })
          //               it("returns true if enough time has passed, has players, eth, and is open", async () => {
          //                   await raffle.enterRaffle({ value: raffleEntranceFee })
          //               })
          //               await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          //               await network.provider.request({ method: "evm_mine", params: [] })
          //               const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
          //               assert(upkeepNeeded)
          //           })
          //           describe("performUpKeep", () => {
          //               it("it can only run if checkupKeep is true", async () => {
          //                   await raffle.enterRaffle({ value: raffleEntranceFee })
          //                   await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          //                   await network.provider.request({
          //                       method: "evm_mine",
          //                       params: [],
          //                   })
          //                   const tx = await raffle.performUpkeep("0x")
          //                   assert(tx)
          //               })
          //               it("reverts when checkupkeep is false", async () => {
          //                   await expect(raffle.performUpkeep([])).to.be.revertedWith(
          //                       "Raffle_UpkeepNotNeeded"
          //                   )
          //               })
          //               it("updates the raffle state, emits and event, and call vrf coordinator", async () => {
          //                   await raffle.enterRaffle({ value: raffleEntranceFee })
          //                   await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          //                   await network.provider.request({
          //                       method: "evm_mine",
          //                       params: [],
          //                   })
          //                   const txResponse = await raffle.performUpkeep([])
          //                   const txReceipt = await txResponse.wait(1)
          //                   const requestId = txReceipt.events[1].args.requestId
          //                   const raffleState = await raffle.getRaffleState()
          //                   assert(requestId.toNumber() > 0)
          //                   assert(raffleState.toString() == "1")
          //               })
          //           })
          describe("fulfilRandomWords", () => {
              beforeEach(async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  })
              })
              it("can only be called after performUpkeep", async () => {
                  console.log(raffle)
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
              })
              it("picks a winner, resets the lottery, and sends money", async () => {
                  const additionalEntrance = 3
                  const startingIndex = 1
                  const accounts = await ethers.getSigners()
                  for (let i = startingIndex; i < startingIndex + additionalEntrance; i++) {
                      const accountConnectedRaffle = await raffle.connect(accounts[i])
                      // raffle = raffleContract.connect(accounts[i])
                      await accountConnectedRaffle.enterRaffle({
                          value: raffleEntranceFee,
                      })
                  }
                  const stratingTimeStamp = await raffle.getLastTimeStamp()

                  //performUpkeep (mock being Chainlink Keepers)
                  // fulfillRandomWords (mock being the Chainlink VRF)
                  // We will have to wait for the fulfillRandomWords to be called

                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("Found the event!")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              console.log(recentWinner)
                              console.log(accounts[2])
                              console.log(accounts[0])
                              console.log(accounts[1])
                              console.log(accounts[3])
                              const raffleState = await raffle.getRaffleState()
                              const endingTimeStamp = await raffle.getLastTimeStamp()
                              const winnerBalance = await accounts[1].getBalance()

                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[2].address)
                              assert.equal(raffleState, 0)

                              assert.equal(
                                  winnerBalance.toString(),
                                  startingBalance
                                      .add(
                                          raffleEntranceFee
                                              .mul(additionalEntrance)
                                              .add(raffleEntranceFee)
                                      )
                                      .toString()
                              )

                              const numPlayers = await raffle.getNumberOfPlayer()
                              assert.equal(numPlayers.toString(), "0")
                              assert.equal(raffleState.toString(), "0")
                              assert(endingTimeStamp > stratingTimeStamp)
                          } catch (e) {
                              reject(e)
                          }
                          resolve()
                      })
                      // Setting up the listener
                      // below, we will fire the event, and the listener will pick it up, and resolve
                      const tx = await raffle.performUpkeep([])
                      const txReceipt = await tx.wait(1)
                      const startingBalance = await accounts[2].getBalance()
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.events[1].args.requestId,
                          raffle.address
                      )
                  })
              })
          })
      })

// const { assert, expect } = require("chai")
// const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
// const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

// !developmentChains.includes(network.name)
//     ? describe.skip
//     : describe("Raffle Unit Tests", () => {
//           let raffle,
//               vrfCoordinatorV2Mock,
//               deployer,
//               interval,
//               entranceFee,
//               gasLane,
//               callbackGasLimit,
//               NUM_WORDS,
//               REQUEST_CONFIRMATIONS
//           const chainId = network.config.chainId
//           beforeEach(async () => {
//               deployer = (await getNamedAccounts()).deployer
//               await deployments.fixture(["all"])
//               raffle = await ethers.getContract("Raffle", deployer)
//               vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
//               interval = await raffle.getInterval()
//               entranceFee = await raffle.getEntranceFee()
//               gasLane = await raffle.getGasLane()
//               callbackGasLimit = await raffle.getCallbackGasLimit()
//               NUM_WORDS = await raffle.getNumWords()
//               REQUEST_CONFIRMATIONS = await raffle.getRequestConfirmations()
//           })

//           describe("constructor", () => {
//               it("initializes the raffle correctly", async () => {
//                   const raffleState = (await raffle.getRaffleState()).toString()
//                   assert.equal(raffleState, "0")
//                   assert.equal(interval.toString(), networkConfig[chainId]["interval"])
//                   assert.equal(entranceFee.toString(), networkConfig[chainId]["entranceFee"])
//                   assert.equal(gasLane.toString(), networkConfig[chainId]["gasLane"])
//                   assert.equal(
//                       callbackGasLimit.toString(),
//                       networkConfig[chainId]["callbackGasLimit"]
//                   )
//               })
//           })

//           describe("enterRaffle", () => {
//               it("revert if you don't pay enough", async () => {
//                   await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
//                       raffle,
//                       "Raffle__NotEnoughETHEntered"
//                   )
//               })
//               it("records players when they enter", async () => {
//                   await raffle.enterRaffle({ value: entranceFee })
//                   const playerFromContract = await raffle.getPlayer(0)
//                   assert.equal(playerFromContract, deployer)
//               })
//               it("emits event on enter", async () => {
//                   await expect(raffle.enterRaffle({ value: entranceFee })).to.emit(
//                       raffle,
//                       "RaffleEnter"
//                   )
//               })

//               // For this hook we want RaffleState to be in a close state, currently the state is
//               // OPEN to change it from OPEN to CALCULATING we need to call performUpkeep,
//               // but performUpkeep can only be call if checkUpkeep returns TRUE -- otherwise
//               // it will revert with "Raffle__UpkeepNotNeeded()" -- to make this function return
//               // TRUE, we need isOpen, timePassed, hasPlayers and hasBalance TRUE.
//               it("doesn't allow entrance when raffle is calculating", async () => {
//                   await raffle.enterRaffle({ value: entranceFee })
//                   await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]) // To accelerate the time we use this method to make timePassed true
//                   await network.provider.send("evm_mine", []) // We pass an empty array to only mine one block.
//                   await raffle.performUpkeep([]) // Pretend to be the a Chainlink Node by calling performUpkeep() and pass to it an empty array that represents the empty callData
//                   // Now RaffleState should be in a CALCULATING state.
//                   await expect(
//                       raffle.enterRaffle({ value: entranceFee })
//                   ).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen")
//               })
//           })

//           describe("checkUpkeep", () => {
//               // Since checkUpkeep is a public function using "await raffle.checkUpkeep([])" will result in
//               // a transaction, but I only want to simulate the transaction to see if the state of upkeepNeeded is false.
//               it("returns false if there's no balance in the Raffle", async () => {
//                   await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
//                   await network.provider.send("evm_mine", [])
//                   await raffle.callStatic.checkUpkeep([]) // Use callstatic to simulate the transaction.
//                   const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
//                   assert(!upkeepNeeded)
//               })
//               it("returns false if raffle isn't open", async () => {
//                   await raffle.enterRaffle({ value: entranceFee })
//                   await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
//                   await network.provider.send("evm_mine", [])
//                   await raffle.performUpkeep([])
//                   const raffleState = await raffle.getRaffleState()
//                   const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
//                   assert.equal(raffleState.toString(), "1")
//                   assert.equal(upkeepNeeded, false)
//               })
//           })

//           describe("performUpkeep", () => {
//               it("can only run if checkUpkeep is true", async () => {
//                   await raffle.enterRaffle({ value: entranceFee })
//                   await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
//                   await network.provider.send("evm_mine", [])
//                   const tx = await raffle.performUpkeep([])
//                   assert(tx)
//               })
//               it("reverts when checUpkeep is false", async () => {
//                   // If needed we can be more specific by passing the parameters to Raffle__UpKeepNotNeeded()
//                   await expect(raffle.performUpkeep([])).to.be.revertedWithCustomError(
//                       raffle,
//                       "Raffle__UpKeepNotNeeded"
//                   )
//               })
//               it("updates the raffle state, emits RequestedRaffleWinner and calls the vrfCoordinator", async () => {
//                   await raffle.enterRaffle({ value: entranceFee })
//                   await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
//                   await network.provider.send("evm_mine", [])
//                   const txResponse = await raffle.performUpkeep([])
//                   const txReceipt = await txResponse.wait(1) // To emit RequestedRaffleWinner I need to send a transaction
//                   // The txReceipt for performUpkeep will have two events:
//                   //    - RandomWordsRequested will be in the zeroed index, this event is generated by the VRFCoordinatorV2Mock
//                   //    but the requestId is not easily accesible because the transaction needs to be parsed to extract the ID.
//                   //    - RequestedRaffleWinner will be in the index 1, this event is generated by performUpkeep after the
//                   //    i_vrfCoordinator.requestRandomWords returned the ID, and the args of the event we can access the ID.
//                   // We could say that RequestedRaffleWinner is redundant, but for educational purpose I will leave it there.
//                   const requestId = txReceipt.events[1].args.requestId
//                   const raffleState = await raffle.getRaffleState()
//                   assert(requestId.toNumber() > 0)
//                   assert(raffleState.toString() == "1")
//               })
//           })

//           describe("fulfillRandomWords", () => {
//               // fulfillRandomWords can only be call if there's a requestId, that's guaranteed in the beforeEach hook.
//               beforeEach(async () => {
//                   await raffle.enterRaffle({ value: entranceFee })
//                   await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
//                   await network.provider.send("evm_mine", [])
//               })
//               it("can only be call after perfomUpkeep", async () => {
//                   await expect(
//                       vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
//                   ).to.be.revertedWith("nonexistent request")
//                   await expect(
//                       vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
//                   ).to.be.revertedWith("nonexistent request")
//               })

//               // 1. First we want to call performUpkeep (mock being the Chainlink Keepers).
//               // 2. Then we want to call fulfillRandomWords (mock being the Chainlink VRF).
//               // 3. After both these things have happened we can record if:
//               //    - Recent winner gets recorded
//               //    - RaffleState, s_players and s_lastTimeStamp were reset
//               // 4. To verify the above in a tesnet we will have to wait for fulfillRandoWords
//               // to be called, but in a local blockchain there's no need for that because
//               // we can adjust our blockchain to do whatever we want, but for this test we will
//               // simulate that we have to wait for that event to be called as If we were in a tesnet.
//               // 5. To achieve that we will need to set up an event listener.
//               // 6. Basically we want the test to not finish until the listener has stopped listening
//               // so we need to create a new Promise.
//               it("picks a winner, resets the lottery and sends the prize", async () => {
//                   console.log("Setting up test...")
//                   const additionalEntrances = 3
//                   const startingIndex = 2 // deployer = 0
//                   const accounts = await ethers.getSigners()
//                   for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) {
//                       const accountConnectedRaffle = raffle.connect(accounts[i])
//                       await accountConnectedRaffle.enterRaffle({ value: entranceFee })
//                   }
//                   const startingTimeStamp = await raffle.getLatestTimeStamp()
//                   await new Promise(async (resolve, reject) => {
//                       raffle.once("WinnerPicked", async () => {
//                           // setting up the listener
//                           console.log("winnerPicked event fired!")
//                           try {
//                               const recentWinner = await raffle.getRecentWinner()
//                               console.log(`The winner is ${recentWinner}`) // In our local blockchain there's no randomness, the first player to enter the Raffle will be the winner.
//                               console.log(accounts[0].address)
//                               console.log(accounts[1].address)
//                               console.log(accounts[2].address)
//                               console.log(accounts[3].address)
//                               const raffleState = await raffle.getRaffleState()
//                               const endingTimeStamp = await raffle.getLatestTimeStamp()
//                               const numPlayers = await raffle.getNumberOfPlayers()
//                               const winnerEndingBalance = await accounts[2].getBalance()
//                               assert.equal(numPlayers.toString(), "0")
//                               assert.equal(raffleState.toString(), "0")
//                               assert(endingTimeStamp > startingTimeStamp)

//                               assert.equal(
//                                   winnerEndingBalance.toString(),
//                                   winnerStartingBalance.add(
//                                       entranceFee
//                                           .mul(additionalEntrances)
//                                           .add(entranceFee)
//                                           .toString()
//                                   )
//                               )
//                               resolve()
//                           } catch (e) {
//                               reject(e)
//                           }
//                       })

//                       console.log("Entering Raffle...") // enter raffle
//                       const tx = await raffle.performUpkeep([])
//                       const txReceipt = await tx.wait(1)
//                       console.log("Time to wait...")
//                       const winnerStartingBalance = await accounts[2].getBalance()
//                       // check inside VRFCoordinatorV2Mock to find fulfillRandomWords parameters
//                       await vrfCoordinatorV2Mock.fulfillRandomWords(
//                           txReceipt.events[1].args.requestId,
//                           raffle.address
//                       )
//                       // this code won't complete until the listener finishes listening
//                   })
//               })
//           })

//           describe("getNumWords", () => {
//               it("asserts NUM_WORDS are initialized correctly", async () => {
//                   assert.equal(NUM_WORDS, 1)
//               })
//           })

//           describe("getRequestConfirmations", () => {
//               it("asserts REQUEST_CONFIRMATIONS are initialized correctly", async () => {
//                   assert.equal(REQUEST_CONFIRMATIONS, 3)
//               })
//           })
//       })
