// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Vesting is ERC20, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    
    uint public cliff;
    uint public duration;

    string private constant _name = "21R0CKET";
    string private constant _symbol = "21R";

    struct VestingSchedule {
        // start time of the vesting period
        uint startTime;
        // total amount of tokens to be released at the end of the vesting
        uint256 totalAmount;
        // amount redeemed
        uint256 redeemedAmount;
    }

    mapping (address => VestingSchedule[]) private scheduleList;

    constructor(uint256 _totalSupply, uint256 _cliff, uint _duration) ERC20(_name, _symbol) {
        _mint(msg.sender, _totalSupply);
        cliff = _cliff;
        duration = _duration;
    }

    function getScheduleByAddressAndIndex(address beneficiary, uint index) public view returns(uint startTime, uint256 totalAmount, uint256 redeemedAmount) {
        VestingSchedule memory schedule = scheduleList[beneficiary][index];
        return (schedule.startTime, schedule.totalAmount, schedule.redeemedAmount);
    }

    function getScheduleListByAddress(address beneficiary) public view returns (uint[] memory, uint256[] memory, uint256[] memory) {
        VestingSchedule[] memory list = scheduleList[beneficiary];
        
        uint[] memory startTimes = new uint[](list.length);
        uint256[] memory totalAmounts = new uint256[](list.length);
        uint256[] memory redeemedAmounts = new uint256[](list.length);

        for(uint i = 0; i < list.length; i++) {
            VestingSchedule memory schedule = list[i];
            startTimes[i] = schedule.startTime;
            totalAmounts[i] = schedule.totalAmount;
            redeemedAmounts[i] = schedule.redeemedAmount;
        }

        return (startTimes, totalAmounts, redeemedAmounts);
    }

    function _createSchedule(address to, uint256 amount) private {
        uint startTime = block.timestamp;
        VestingSchedule memory schedule = VestingSchedule(startTime, amount, 0);
        scheduleList[to].push(schedule);
    }

    function _beforeTransfer(address to, uint256 amount) private {
        _createSchedule(to, amount);
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _beforeTransfer(recipient, amount);
        _transfer(msg.sender, recipient, amount);
        return true;
    }
}
