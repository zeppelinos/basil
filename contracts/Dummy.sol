pragma solidity ^0.4.21;

// NOTE: The contracts imported here are used in zos but not in the Basil
// implementation itself.
// Given that some of these zos contracts are used in the tests, we need to 'mention'
// them in solidity, so that the truffle compiler picks them up and their artifacts end up
// in the build folder.
// For more, see: https://github.com/zeppelinos/labs/issues/73

import "zos-core/contracts/Registry.sol";
import "zos-core/contracts/ProjectController.sol";
import "zos-core/contracts/upgradeability/UpgradeabilityProxyFactory.sol";
import "zos-core/contracts/upgradeability/OwnedUpgradeabilityProxy.sol";

contract Dummy {}
