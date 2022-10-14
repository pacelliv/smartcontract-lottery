const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", () => {
          let raffle,
              vrfCoordinatorV2Mock,
              deployer,
              interval,
              entranceFee,
              gasLane,
              subscriptionId,
              callbackGasLimit
          const chainId = network.config.chainId
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              interval = await raffle.getInterval()
              entranceFee = await raffle.entranceFee()
              gasLane = await raffle.getGasLane()
              callbackGasLimit = await raffle.getCallbackGasLimit()
          })

          describe("constructor", () => {
              it("initializes the raffle correctly", async () => {
                  const raffleState = (await raffle.getRaffleState()).toString()
                  assert.equal(raffleState, "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
                  assert.equal(entranceFee.toString(), networkConfig[chainId]["entranceFee"])
                  assert.equal(gasLane.toString(), networkConfig[chainId]["gasLane"])
                  assert.equal(
                      callbackGasLimit.toString(),
                      networkConfig[chainId]["callbackGasLimit"]
                  )
              })
          })

          describe("enterRaffle", () => {
              it("revert if you don't pay enough", async () => {
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__NotEnoughETHEntered"
                  )
              })
              it("records players when they enter", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  const playerFromContract = await raffle.getPlayer(0)
                  assert.equal(playerFromContract, deployer)
              })
              it("emits event on enter", async () => {
                  await expect(raffle.enterRaffle({ value: entranceFee })).to.emit(
                      raffle,
                      "RaffleEnter"
                  )
              })
              it("doesn't allow entrance when raffle is calculating", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  // We want RaffleState to be in a close state, currently the state is OPEN
                  // to change it from OPEN to CALCULATING me we need to call performUpkeep()
                  // but performUpkeep() can only be call if checkUpkeep returns TRUE otherwise
                  // it will revert with Raffle__UpkeepNotNeeded() to make this function to return
                  // TRUE we need to set make isOpen, timePassed, hasPlayers and hasBalance TRUE.
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  // We pass an empty array to only mine one block.
                  await network.provider.send("evm_mine", [])
                  // Pretend to be the Chainlink Keeper, call performUpkeep() and pass it an empty
                  // array, the empty array represents the empty callData.
                  await raffle.performUpkeep([])
                  // Now RaffleState should be in an OPEN state.
                  await expect(raffle.enterRaffle({ value: entranceFee })).to.be.revertedWith(
                      "Raffle__NotOpen"
                  )
              })
          })

          describe("checkUpkeep", () => {
              it("returns false if people haven't sent any ETH", async () => {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  // Since checkUpkeep is a public function using await raffle.checkUpkeep([]) will
                  // result in sending a transaction, I only want to simulate the transaction to see
                  // so we use callstatic to simulate the transaction.
                  await raffle.callStatic.checkUpkeep([])
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded)
              })
              it("returns false if raffle isn't open", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await raffle.performUpkeep([])
                  const raffleState = await raffle.getRaffleState()
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert.equal(raffleState.toString(), "1")
                  assert.equal(upkeepNeeded, false)
              })
          })

          describe("performUpkeep", () => {
              it("can only run if checkUpkeep is true", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const tx = await raffle.performUpkeep([])
                  assert(tx)
              })
              it("reverts when checUpkeep is false", async () => {
                  // I can be more specific by passing the parameters in Raffle__UpKeepNotNeeded()
                  await expect(raffle.performUpkeep([])).to.be.revertedWith(
                      "Raffle__UpKeepNotNeeded"
                  )
              })
              it("updates the raffle state, emits and event and calls the vrfCoordinator", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const txResponse = await raffle.performUpkeep([])
                  const txReceipt = await txResponse.wait(1)
                  // From my contract I can get requestId from emit RequestedRaffleWinner(requestId)
                  // However if look at my VRFCoordinatorV2Mock.sol I will in it, I will see that If I
                  // call requestRandomWords() from this mock it also emits an event with randomWords requested
                  // This means that the emit event in my contract is redundant line 152. But for educational
                  // purposes I will leave it there.
                  // The event in the zeroed index is uint256 requestId = i_vrfCoordinator.requestRandomWords(),
                  // that's why I need the event in the index 1.
                  const requestId = txReceipt.events[1].args.requestId
                  const raffleState = await raffle.getRaffleState()
                  assert(requestId.toNumber() > 0)
                  assert(raffleState.toString() == "1")
              })
          })

          describe("fulfillRandomWords", () => {
              beforeEach(async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
              })
              // fulfillRandomWords can olny be call if there's a requestId
              // if you check inside VRFCoordinatorV2Mock you will see the fulfillRandomWords() function
              it("can only be call after perfomUpkeep", async () => {
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
              })
              it("picks a winner, resets the lottery and sends money", async () => {
                  const additionalEntrances = 3
                  const startingIndex = 1 // deployer = 0
                  const accounts = await ethers.getSigners()
                  for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) {
                      const accountConnectedRaffle = raffle.connect(accounts[i])
                      await accountConnectedRaffle.enterRaffle({ value: entranceFee })
                  }
                  const startingTimeStamp = await raffle.getLatestTimeStamp()
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          // setting up the listener
                          console.log("WinnerPicked event fired!")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              //console.log(recentWinner)
                              const raffleState = await raffle.getRaffleState()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()
                              const numPlayers = await raffle.getNumberOfPlayers()
                              assert.equal(numPlayers.toString(), "0")
                              assert.equal(raffleState.toString(), "0")
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (e) {
                              reject(e)
                          }
                      })
                      const tx = await raffle.performUpkeep("0x")
                      const txReceipt = await tx.wait(1)
                      // check inside VRFCoordinatorV2Mock to find fulfillRandomWords(params)
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.events[1].args.requestId,
                          raffle.address
                      )
                  })
              })
          })
      })
