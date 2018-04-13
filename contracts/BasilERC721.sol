pragma solidity ^0.4.21;

import "./Basil.sol";
import "kernel/contracts/test/kernel_instance/ERC721Token.sol";

contract BasilERC721 is Basil {

  ERC721Token public erc721;
  uint256 public numEmittedTokens;

  function setERC721(address _erc721Address) external onlyOwner {
    require(_erc721Address != address(0));
    require(address(erc721) == address(0));
    erc721 = ERC721Token(_erc721Address);
    erc721.initialize();
  }

  function donate(uint256 _r, uint256 _g, uint256 _b) public payable {
    super.donate(_r, _g, _b);
    emitUniqueToken(tx.origin);
  }

  function emitUniqueToken(address _tokenOwner) internal {
    erc721.mint(_tokenOwner, numEmittedTokens);
    numEmittedTokens++;
  }
}
