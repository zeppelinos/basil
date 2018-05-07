#! /usr/bin/env bash

# TODO: remove --no-install from vesion update

NETWORK=$1
OWNER=$2
INJECT_ZOS=$3

echo "NETWORK = "$NETWORK
echo "OWNER = "$OWNER
echo "INJECT_ZOS= "$INJECT_ZOS

# -----------------------------------------------------------------------
# Project setup and first implementation of an upgradeable Basil.sol
# -----------------------------------------------------------------------

# Clean up package.zos.* files
rm -f package.zos.*

# Util to trace accounts.
# echo "console.log(web3.eth.accounts)" | truffle console --network $NETWORK
# exit

# Compile all contracts.
# echo "npx truffle compile"
# npx truffle compile

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
echo "zos create-proxy Basil --init --params "$OWNER" --network $NETWORK"
zos create-proxy Basil --init --params $OWNER --network $NETWORK

# -------------------------------------------------------------------------------
# New version of Basil.sol that uses an on-chain ERC721 token implementation
# -------------------------------------------------------------------------------

# Upgrade the project to a new version, so that new implementations can be registered
echo "zos new-version 0.0.2 --network $NETWORK"
zos new-version 0.0.2 --stdlib openzeppelin\-zos --no-install --network $NETWORK

# If on a local network, inject a simulation of the stdlib.
if [ $INJECT_ZOS == true ] 
then
  echo "zos deploy-all --network $NETWORK"
  zos deploy-all --network $NETWORK
fi

# Upgrade main contract version
echo "zos add-implementation BasilERC721 Basil --network $NETWORK"
zos add-implementation BasilERC721 Basil --network $NETWORK

# Deploy all implementations in the specified network.
echo "zos sync --network $NETWORK"
zos sync --network $NETWORK

# Create a proxy for the standard library's ERC721 token.
BASIL=$(jq ".proxies.Basil[0].address" package.zos.$NETWORK.json --raw-output)
# BASIL=$(jq ".proxies.Basil[0].address" package.zos.$NETWORK.json)
echo "Using Basil proxy deployed at: "$BASIL
echo "zos create-proxy MintableERC721Token --from "$OWNER" --params "$BASIL",BasilToken,BSL --network $NETWORK"
zos create-proxy MintableERC721Token --from $OWNER --init --params $BASIL,BasilToken,BSL --network $NETWORK

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# CURRENTLY FAILING HERE IN ROPSTEN: most likely it isn't finding the deployed stdlib address
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# Read deployed addresses
ERC721=$(jq ".proxies.MintableERC721Token[0].address" package.zos.$NETWORK.json)
echo "Token deployed at: "$ERC721

# Upgrade the existing contract proxy to use the new version
echo "zos upgrade-proxy Basil null --network $NETWORK"
zos upgrade-proxy Basil null --network $NETWORK

# Register the token in Basil.
echo "BasilERC721.at(\"$BASIL\").setToken($ERC721, {from: \"$OWNER\"})" | truffle console --network $NETWORK
