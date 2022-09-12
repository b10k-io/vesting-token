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
    
    uint public duration;

    string private constant _name = "21R0CKET";
    string private constant _symbol = "21R";

    constructor(uint256 _totalSupply, uint _duration) ERC20(_name, _symbol) {
        _mint(msg.sender, _totalSupply);
        duration = _duration;
    }
}
