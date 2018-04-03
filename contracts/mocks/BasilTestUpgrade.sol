pragma solidity ^0.4.18;

import '../Basil.sol';

/**
 * @title BasilTestUpgrade 
 */
contract BasilTestUpgrade is Basil {

  function sayHi() public pure returns (string) {
    return "Hi!";
  }
}
