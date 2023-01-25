// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import "hardhat/console.sol";

error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();
error Raffle__NotOpen();
error Raffle__UpKeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/**
 * @title A sample of a lottery contract.
 * @author Eugenio Flores.
 * @notice This contract is a demo of an untamperable, decentralized smart contract lottery.
 * @dev This contract implements Chainlink VRF v2 and Chainlink Keepers.
 */

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

contract Raffle is VRFConsumerBaseV2, AutomationCompatibleInterface {
    /*Type declarations */

    enum RaffleState {
        OPEN, // equivalent to 0
        CALCULATING // equivalent to 1
    }

    /*State Variables */
    // s_players is going to be in storage because the size of this array is variable.
    address payable[] private s_players;
    // Variables that are declared at deployment and will never changed should me mark as immutable
    uint256 private immutable i_entranceFee;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    // To save gas, all constant variables should be mark as constant to avoid assign them a slot in
    // storage and instead save them in the bytecode.
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    //Lottery Variables
    address private s_recentWinner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;

    /*Events */
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    /*Functions */
    constructor(
        address vrfCoordinatorV2, // adreess of the Coordinator that makes the random number verification.
        uint256 entranceFee,
        bytes32 gasLane, //keyHash
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    receive() external payable {}

    fallback() external payable {}

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHEntered();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }
        s_players.push(payable(msg.sender));

        emit RaffleEnter(msg.sender); // Name events with the reverse name of the function.
    }

    /**
     * @dev checkUpkeep is the function that the Chainlink Keepers nodes will call to know if performUpKeep()
     * should be call by them. The Keepers will simulate off-chain the logic inside this functions.
     * The following conditions must be true in order for `upKeepNeeded` to return true:
     * 1. Our time interval should have passed.
     * 2. The lottery should have al least 1 player and have some ETH.
     * 3. Our subscription is funded with LINK.
     * 4. The lottery should be in an "open" state.
     *
     * @return upkeepNeeded a boolean to indicate if the Keepers should call performUpkeep to kick-off
     * a VRF request.
     */
    function checkUpkeep(
        // CheckData allows to specify anything when the checkUpKeep is called. Having checkData of type
        // bytes allows to specify it to call other functions. CheckData can be commented out but I still
        // need to specify the type of the parameters.
        bytes memory /*checkData*/
    )
        public
        view
        override
        returns (
            // checkUpkeep was mark as public to be able to be calle by this contract.
            bool upkeepNeeded,
            bytes memory /*performData */
        )
    {
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
        return (upkeepNeeded, "0x0"); // Could this be commented out? Yes, because of implicit return.
    }

    /**
     * @dev performUpkeep() is the function the Chainlink nodes will call to kick off an Chainlink VRF request.
     * This function can only be call if upkeepNeeded is true and this function will emit an event requesting for
     * randomness. requestId is the randomness order to be fulfilled by the Chainlink VFR service.
     *
     * Emits a {RequestedRaffleWinner} event.
     */
    function performUpkeep(bytes calldata /*performData */) external override {
        // Since I'm passing an empty string to checkUpKeep("") and this function requires a calldata, and calldata doesn't work with strings,
        // I need to specify performData as memory in checkUpkeep.
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle__UpKeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
    }

    /**
     * @dev After the Chainlink nodes fulfilled the randomness order by generating the random words in an off-chain calculation,
     * they will call fulfillRandomWords() in this contract and pass to it the requestId and the randomWords array as parameters.
     * An event will be triggered after the on-chain calculation of selecting a winner and sending the prize (balance) to the winner
     * of the lottery. Think of this function as fullfiled random numbers
     * @param randomWords Random numbers sent by the Coordinator after fulfilling the request id.
     *
     * Emits a {WinnerPicked} event.
     */
    function fulfillRandomWords(
        uint256 /* requestId not used in this contract*/,
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length; // Using the random words we select a winner using the Modulo function.
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    /* Getters: View and pure functions */
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getGasLane() public view returns (bytes32) {
        return i_gasLane;
    }

    function getCallbackGasLimit() public view returns (uint32) {
        return i_callbackGasLimit;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }
}
