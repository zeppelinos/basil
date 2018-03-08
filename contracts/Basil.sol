pragma solidity ^0.4.18;

import 'zos-core/contracts/ownership/Ownable.sol';
import './OwnedUpgradeableBasilStorage.sol';

// TODO: needed for tests, see how to get truffle
// to find these without this hack
import 'zos-core/contracts/Registry.sol';
import 'zos-core/contracts/Factory.sol';

/**
 * @title Basil
 */
contract Basil is OwnedUpgradeableBasilStorage, Ownable {

  function Basil() 
    Ownable()
    OwnedUpgradeableBasilStorage()
    public
  {}
  
  event Withdrawal(address indexed wallet, uint256 value);
  event NewDonation(address indexed donor, uint256 value, uint256 r, uint256 g, uint256 b);

  function initialize(address owner) public {
    require(!initialized);
    setOwner(owner);
    initialized = true;
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
