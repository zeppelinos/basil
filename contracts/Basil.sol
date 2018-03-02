pragma solidity ^0.4.18;

import './ownership/Ownable.sol';
import './OwnedUpgradeableBasilStorage.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zos-core/contracts/registry/Registry.sol';

/**
 * @title Basil_V0
 * @dev Version 0 of a basil to show upgradeability.
 */
contract Basil is Ownable, OwnedUpgradeableBasilStorage {
  
  event Withdrawal(address indexed wallet, uint256 value);
  event NewDonation(address indexed donor, uint256 value, uint256 r, uint256 g, uint256 b);

  function initialize(address owner) public {
    require(!_initialized);
    setOwner(owner);
    _initialized = true;
  }

  function donate(uint256 _r, uint256 _g, uint256 _b) external payable {
    require(_r < 256);
    require(_g < 256);
    require(_b < 256);
    require(msg.value > highestDonation);

    r = _r;
    g = _g;
    b = _b;
    highestDonation = msg.value;
    NewDonation(msg.sender, msg.value, r, g, b);
  }

  function withdraw(address wallet) public onlyOwner {
    require(this.balance > 0);
    require(wallet != address(0));
    uint256 value = this.balance;
    wallet.transfer(value);
    Withdrawal(wallet, value);
  }

}
