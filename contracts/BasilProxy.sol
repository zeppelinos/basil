pragma solidity ^0.4.18;

import './BasilStorage.sol';
import './OwnedUpgradeabilityProxy.sol';

/**
 * @title BasilProxy
 * @dev This proxy holds the storage of the basil contract and delegates every call to the current implementation.
 * Besides, it allows to upgrade the basil's behaviour towards further implementations.
 */
contract BasilProxy is OwnedUpgradeabilityProxy, BasilStorage {}
