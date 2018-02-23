pragma solidity ^0.4.18;

import './BasilStorage.sol';
import './UpgradeabilityStorage.sol';
import './UpgradeabilityOwnerStorage.sol';

/**
 * @title OwnedUpgradeableBasilStorage
 * @dev This is the storage necessary to perform upgradeable contracts.
 * This means, required state variables for owned upgradeability purpose and those strictly related to basil contracts.
 */
contract OwnedUpgradeableBasilStorage is UpgradeabilityStorage, UpgradeabilityOwnerStorage, BasilStorage {}
