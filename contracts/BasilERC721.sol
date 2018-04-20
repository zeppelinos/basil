pragma solidity ^0.4.21;

import "./Basil.sol";
import "zeppelin-zos/contracts/token/ERC721/ERC721Token.sol";

contract BasilERC721 is Basil {

  ERC721Token public token;
  uint256 public numEmittedTokens;

  function setToken(address _erc721Address) external onlyOwner {
    require(_erc721Address != address(0));
    require(address(token) == address(0));
    token = ERC721Token(_erc721Address);
    token.initialize();
  }

  function donate(uint256 _r, uint256 _g, uint256 _b) public payable {
    super.donate(_r, _g, _b);
    emitUniqueToken(tx.origin);
  }

  function emitUniqueToken(address _tokenOwner) internal {
    token.mint(_tokenOwner, numEmittedTokens);
    numEmittedTokens++;
  }
}
