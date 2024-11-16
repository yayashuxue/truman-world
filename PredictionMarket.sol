// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PredictionMarket {
    struct BetOption {
        uint256 totalBets; // Total amount of bets for this option
        mapping(address => uint256) bets; // Individual bets per user
        address[] bettors; // List of bettors for this option
    }

    struct Bet {
        string question;
        string[2] options; // Two betting options
        BetOption[2] optionData; // Data for each option
        uint256 totalPool; // Total pool of ETH for this bet
        uint256 endTime; // Bet closing time
        bool resolved; // Whether the bet has been resolved
        uint8 winningOption; // Winning option index (0 or 1)
        address creator; // Address of the bet creator
    }

    mapping(uint256 => Bet) public bets; // All bets
    uint256 public betCount; // Count of bets

    address public agent; // Only agent can create or resolve bets

    modifier onlyAgent() {
        require(msg.sender == agent, "Only agent can perform this action");
        _;
    }

    constructor(address _agent) {
        agent = _agent;
    }

    function createBet(
        string memory _question,
        string[2] memory _options,
        uint256 _duration
    ) public payable onlyAgent returns (uint256) {
        require(msg.value == 0.002 ether, "Initial funding of 0.002 ETH required");

        Bet storage newBet = bets[betCount];
        newBet.question = _question;
        newBet.options = _options;
        newBet.endTime = block.timestamp + _duration;
        newBet.creator = msg.sender;

        uint256 initialBet = 0.001 ether;
        for (uint8 i = 0; i < 2; i++) {
            newBet.optionData[i].totalBets += initialBet;
            newBet.optionData[i].bets[msg.sender] = initialBet;
            newBet.optionData[i].bettors.push(msg.sender); // Add the agent as the initial bettor
            newBet.totalPool += initialBet;
        }

        betCount++;
        return betCount - 1;
    }

    function placeBet(uint256 _betId, uint8 _optionIndex) public payable {
        require(_optionIndex < 2, "Invalid option index");
        Bet storage bet = bets[_betId];
        require(block.timestamp < bet.endTime, "Betting time has ended");
        require(!bet.resolved, "Bet has been resolved");
        require(msg.value > 0, "Bet amount must be greater than zero");

        BetOption storage optionData = bet.optionData[_optionIndex];
        if (optionData.bets[msg.sender] == 0) {
            optionData.bettors.push(msg.sender); // Add new bettor only if they haven't bet before
        }
        optionData.totalBets += msg.value;
        optionData.bets[msg.sender] += msg.value;
        bet.totalPool += msg.value;
    }

    function resolveBet(uint256 _betId, uint8 _winningOption) public onlyAgent {
        require(_winningOption < 2, "Invalid winning option index");
        Bet storage bet = bets[_betId];
        require(!bet.resolved, "Bet already resolved");

        bet.resolved = true;
        bet.winningOption = _winningOption;

        BetOption storage winningOptionData = bet.optionData[_winningOption];
        uint256 totalWinningBets = winningOptionData.totalBets;

        // Prevent division by zero
        if (totalWinningBets == 0) {
            totalWinningBets = 1;
        }

        // Iterate over bettors and distribute winnings
        for (uint256 i = 0; i < winningOptionData.bettors.length; i++) {
            address bettor = winningOptionData.bettors[i];
            uint256 betAmount = winningOptionData.bets[bettor];
            if (betAmount > 0) {
                uint256 winnings = (betAmount * bet.totalPool) / totalWinningBets;
                payable(bettor).transfer(winnings);
            }
        }
    }

    // Dynamically calculate odds
    function getOdds(uint256 _betId) public view returns (uint256[2] memory) {
        Bet storage bet = bets[_betId];
        uint256[2] memory odds;
        for (uint8 i = 0; i < 2; i++) {
            if (bet.optionData[i].totalBets > 0) {
                odds[i] = (bet.totalPool * 1e18) / bet.optionData[i].totalBets; // Scaled to 18 decimals
            } else {
                odds[i] = 0; // No bets, odds are 0
            }
        }
        return odds;
    }
}
