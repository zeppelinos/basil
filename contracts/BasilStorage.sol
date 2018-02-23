pragma solidity ^0.4.18;

import './ownership/OwnableStorage.sol';

/**
 * @title BasilStorage
 * @dev This contract holds all the necessary state variables to carry out the storage of a basil contract
 */
contract BasilStorage is OwnableStorage {
  // color
  uint256 public r;
  uint256 public g;
  uint256 public b;

  // Tells whether the basil has been initialized or not
  bool internal _initialized;

  // highest donation in wei
  uint256 public highestDonation;
}
