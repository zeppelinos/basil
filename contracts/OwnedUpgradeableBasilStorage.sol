pragma solidity ^0.4.18;

import './BasilStorage.sol';
import 'zos-core/contracts/upgradeability/OwnedUpgradeabilityStorage.sol';

/**
 * @title OwnedUpgradeableBasilStorage
 * @dev This is the storage necessary to perform upgradeable basils.
 * This means, required state variables for owned upgradeability purpose and those strictly related to basil contracts.
 */
contract OwnedUpgradeableBasilStorage is OwnedUpgradeabilityStorage, BasilStorage {}
