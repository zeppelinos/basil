pragma solidity ^0.4.21;

import "./Basil.sol";
import "openzeppelin-zos/contracts/token/ERC721/MintableERC721Token.sol";
import "openzeppelin-zos/contracts/math/SafeMath.sol";

contract BasilERC721 is Basil {
  using SafeMath for uint256;

  // ERC721 non-fungible tokens to be emitted on donations.
  MintableERC721Token public token;
  uint256 public numEmittedTokens;

  function setToken(MintableERC721Token _token) external onlyOwner {
    require(_token != address(0));
    require(token == address(0));
    token = _token;
  }

  function donate(uint256 _r, uint256 _g, uint256 _b) public payable {
    super.donate(_r, _g, _b);
    emitUniqueToken(tx.origin);
  }

  function emitUniqueToken(address _tokenOwner) internal {
    token.mint(_tokenOwner, numEmittedTokens);
    numEmittedTokens = numEmittedTokens.add(1);
  }
}
