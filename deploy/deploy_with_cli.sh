#! /usr/bin/env bash

# TODO: remove --no-install from vesion update

NETWORK=$1

# -----------------------------------------------------------------------
# Project setup and first implementation of an upgradeable Basil.sol
# -----------------------------------------------------------------------

echo "npx truffle compile"
npx truffle compile

# Initialize project
# NOTE: Creates a package.zos.json file that keeps track of the project's details
echo "zos init MyProject 0.0.1 --network $NETWORK"
zos init Basil 0.0.1 --network $NETWORK

# Register Basil.sol in the project as an upgradeable contract.
echo "zos add-implementation Basil Basil --network $NETWORK"
zos add-implementation Basil Basil --network $NETWORK

# Deploy all implementations in the specified network.
# NOTE: Creates another package.zos.<network_name>.json file, specific to the network used, which keeps track of deployed addresses, etc.
echo "zos sync --network $NETWORK"
zos sync --network $NETWORK

# Request a proxy for the upgradeably Basil.sol
# NOTE: A dapp could now use the address of the proxy specified in package.zos.<network_name>.json
echo "zos create-proxy Basil --network $NETWORK"
zos create-proxy Basil --network $NETWORK

# -------------------------------------------------------------------------------
# New version of Basil.sol that uses an on-chain ERC721 token implementation
# -------------------------------------------------------------------------------

# Upgrade the project to a new version, so that new implementations can be registered
echo "zos new-version 0.0.2 --network $NETWORK"
zos new-version 0.0.2 --stdlib openzeppelin-zos --no-install --network $NETWORK

# Upgrade main contract version
echo "zos add-implementation BasilERC721 Basil --network $NETWORK"
zos add-implementation BasilERC721 Basil --network $NETWORK

# Deploy all implementations in the specified network.
echo "zos sync --network $NETWORK"
zos sync --network $NETWORK

#
echo "zos create-proxy MintableERC721Token --network $NETWORK"
zos create-proxy MintableERC721Token --network $NETWORK

#
DONATIONS=$(jq ".proxies.Basil[0].address" package.zos.local.json)
ERC721=$(jq ".proxies.MintableERC721Token[0].address" package.zos.local.json)
echo $DONATIONS
echo $ERC721

# Upgrade the existing contract proxy to use the new version
# echo "zos upgrade-proxy Basil null --network $NETWORK"
# zos upgrade-proxy Basil null --network $NETWORK

