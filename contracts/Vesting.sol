// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Vesting is ERC20, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    uint public defaultCliff;
    uint public defaultDuration;

    string private constant _name = "TwentyOne";
    string private constant _symbol = "21";

    struct VestingSchedule {
        // start time of the vesting period
        uint startTime;
        // cliff of the vesting period
        uint cliff;
        // duration of the vesting period
        uint duration;
        // total amount of tokens to be released at the end of the vesting
        uint256 totalAmount;
        // amount released
        uint256 releasedAmount;
    }

    mapping(address => VestingSchedule[]) private scheduleList;

    constructor(
        uint256 _totalSupply,
        uint256 _cliff,
        uint _duration
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, _totalSupply);
        defaultCliff = _cliff;
        defaultDuration = _duration;
    }

    // PRIVATE VIEW VESTING FUNCTIONS

    function _vestedAmount(VestingSchedule memory schedule)
        private
        view
        returns (uint256)
    {

        if (block.timestamp < schedule.startTime.add(schedule.cliff)) {
            return 0;
        } else if (block.timestamp >= schedule.startTime.add(schedule.cliff).add(schedule.duration)) {
            return schedule.totalAmount;
        } else {
            return
                schedule.totalAmount.mul(block.timestamp.sub(schedule.startTime.add(schedule.cliff))).div(
                    schedule.duration
                );
        }
    }

    function _totalVestedAmount(address beneficiary)
        private
        view
        returns (uint256)
    {
        uint amount = 0;
        for (uint i = 0; i < scheduleList[beneficiary].length; i++) {
            amount = amount.add(_vestedAmount(_schedule(beneficiary, i)));
        }
        return amount;
    }

    function _releasableAmount(VestingSchedule memory schedule)
        private
        view
        returns (uint256)
    {
        return _vestedAmount(schedule).sub(schedule.releasedAmount);
    }

    function _totalReleasableAmount(address beneficiary)
        private
        view
        returns (uint256)
    {
        uint amount = 0;
        for (uint i = 0; i < scheduleList[beneficiary].length; i++) {
            amount = amount.add(_releasableAmount(_schedule(beneficiary, i)));
        }
        return amount;
    }

    function _schedule(address beneficiary, uint index)
        private
        view
        returns (
            VestingSchedule memory
        )
    {
        return scheduleList[beneficiary][index];
    }

    function _schedules(address beneficiary)
        private
        view
        returns (
            uint[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        VestingSchedule[] memory list = scheduleList[beneficiary];

        uint[] memory startTimes = new uint[](list.length);
        uint256[] memory totalAmounts = new uint256[](list.length);
        uint256[] memory releasedAmounts = new uint256[](list.length);

        for (uint i = 0; i < list.length; i++) {
            VestingSchedule memory schedule = _schedule(beneficiary, i);
            startTimes[i] = schedule.startTime;
            totalAmounts[i] = schedule.totalAmount;
            releasedAmounts[i] = schedule.releasedAmount;
        }

        return (startTimes, totalAmounts, releasedAmounts);
    }

    // PUBLIC VIEW VESTING FUNCTIONS

    function getVestedAmountByAddressAndIndex(address beneficiary, uint index)
        public
        view
        returns (uint256)
    {
        return _vestedAmount(_schedule(beneficiary, index));
    }

    function getTotalVestedAmountByAddress(address beneficiary)
        public
        view
        returns (uint256)
    {
        return _totalVestedAmount(beneficiary);
    }

    function getReleasableAmountByAddressAndIndex(
        address beneficiary,
        uint index
    ) public view returns (uint256) {
        return _releasableAmount(_schedule(beneficiary, index));
    }

    function getTotalReleasableAmountByAddress(address beneficiary)
        public
        view
        returns (uint256)
    {
        return _totalReleasableAmount(beneficiary);
    }

    function getScheduleByAddressAndIndex(address beneficiary, uint index)
        public
        view
        returns (
            uint,
            uint,
            uint,
            uint256,
            uint256
        )
    {
        VestingSchedule memory schedule = _schedule(beneficiary, index);
        return (
            schedule.startTime,
            schedule.cliff,
            schedule.duration,
            schedule.totalAmount,
            schedule.releasedAmount
        );
    }

    function getSchedulesByAddress(address beneficiary)
        public
        view
        returns (
            uint[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        return _schedules(beneficiary);
    }

    // PRIVATE ACTIONS

    function _createSchedule(address to, uint cliff, uint duration, uint256 amount) private {
        uint startTime = block.timestamp;
        VestingSchedule memory schedule = VestingSchedule(startTime, cliff, duration, amount, 0);
        scheduleList[to].push(schedule);
    }

    function _updateSchedule(
        address beneficiary,
        uint index,
        uint256 amount
    ) private returns (uint256) {
        VestingSchedule memory schedule = scheduleList[beneficiary][index];

        uint256 releasableAmount = _releasableAmount(schedule);
        uint256 leftover = 0;

        if (releasableAmount <= 0) {
            // do nothing
        } else if (amount <= releasableAmount) {
            schedule.releasedAmount = schedule.releasedAmount.add(amount);
        } else {
            schedule.releasedAmount = schedule.releasedAmount.add(
                releasableAmount
            );
            leftover = amount.sub(releasableAmount);
        }

        scheduleList[beneficiary][index] = schedule;
        return leftover;
    }

    function _updateSchedules(address beneficiary, uint256 amount) private {
        VestingSchedule[] memory list = scheduleList[msg.sender];

        for (uint i = 0; i < list.length; i++) {
            if (amount > 0) {
                amount = _updateSchedule(beneficiary, i, amount);
            }
        }
    }

    function _beforeTransfer(address to, uint256 amount) private view {
        // check if amount <= total releasable amount
        if (msg.sender != owner()) {
            require(
                amount <= _totalReleasableAmount(msg.sender),
                "Vesting: amount if greater than releasable."
            );
        }
    }

    function _afterTransfer(address to, uint256 amount) private {
        if (to != owner()) {
            _createSchedule(to, defaultCliff, defaultDuration, amount);
        }
        if (msg.sender != owner()) {
            _updateSchedules(msg.sender, amount);
        }
    }

    // PUBLIC ACTIONS

    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _beforeTransfer(recipient, amount);
        _transfer(msg.sender, recipient, amount);
        _afterTransfer(recipient, amount);
        return true;
    }
}
