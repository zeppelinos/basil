pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Basil is Ownable {
  uint256 public r;
  uint256 public g;
  uint256 public b;
  uint256 public highestDonation;

  event Withdrawal(address indexed wallet, uint256 value);
  event NewDonation(address indexed donor, uint256 value, uint256 r, uint256 g, uint256 b);

  function Basil() Ownable() public {}

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
    require(wallet != address(0));
    uint256 value = this.balance;
    wallet.transfer(value);
    Withdrawal(wallet, value);
  }
}
