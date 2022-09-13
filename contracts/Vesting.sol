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

    // struct VestingSchedule {
    //     // beneficiary of tokens
    //     address beneficiary;
    //     // start time of the vesting period
    //     uint256 start;
    //     // total amount of tokens to be released at the end of the vesting
    //     uint256 totalAmount;
    //     // amount released
    // }

    // mapping (address => VestingSchedule[]) private vestingSchedules;

    constructor(uint256 _totalSupply, uint256 _cliff, uint _duration) ERC20(_name, _symbol) {
        _mint(msg.sender, _totalSupply);
        cliff = _cliff;
        duration = _duration;
    }

    // function _createVestingSchedule(address to, uint256 amount) private {
    //     uint256 start = block.timestamp;
    //     VestingSchedule memory schedule = VestingSchedule(to, start, amount);
    //     VestingSchedule[] storage schedules = vestingSchedules[to];
    //     schedules.push(schedule);
    //     vestingSchedules[to] = schedules;
    // }

    // function _beforeTransfer(address to, uint256 amount) private {
    //     _createVestingSchedule(to, amount);
    // }

    // function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
    //     _beforeTransfer(recipient, amount);
    //     _transfer(msg.sender, recipient, amount);
    //     return true;
    // }
}
