#! /usr/bin/env bash

# Enable command logging.
set -x

NETWORK=$1
INJECT_ZOS=$2
OWNER=$3

"NETWORK = "$NETWORK
"OWNER = "$OWNER
"INJECT_ZOS= "$INJECT_ZOS

# Util to trace accounts.
# echo "console.log(web3.eth.accounts)" | truffle console --network $NETWORK
# exit

# -----------------------------------------------------------------------
# Project setup and first implementation of an upgradeable Basil.sol
# -----------------------------------------------------------------------

# Clean up package.zos.* files
rm -f package.zos.json
rm -f package.zos.$NETWORK.json

# Compile all contracts.
rm -rf build && npx truffle compile

# Initialize project
# NOTE: Creates a package.zos.json file that keeps track of the project's details
zos init Basil 0.0.1

# Register Basil.sol in the project as an upgradeable contract.
zos add Basil

# Deploy all implementations in the specified network.
# NOTE: Creates another package.zos.<network_name>.json file, specific to the network used, which keeps track of deployed addresses, etc.
zos push --network $NETWORK --skip-compile

# Request a proxy for the upgradeably Basil.sol
# NOTE: A dapp could now use the address of the proxy specified in package.zos.<network_name>.json
zos create Basil --args $OWNER --network $NETWORK

# -------------------------------------------------------------------------------
# New version of Basil.sol that uses an on-chain ERC721 token implementation
# -------------------------------------------------------------------------------

# Upgrade the project to a new version, so that new implementations can be registered
zos bump 0.0.2

# Upgrade main contract version
zos add BasilERC721:Basil

# Deploy all implementations in the specified network.
zos push --network $NETWORK --skip-compile

# Upgrade the existing contract proxy to use the new version
BASIL=$(jq ".proxies.Basil[0].address" package.zos.$NETWORK.json --raw-output)
zos upgrade Basil "$BASIL" --network $NETWORK

# Link to ZeppelinOS standard library
zos link openzeppelin\-zos --no-install

# If on a local network, inject a simulation of the stdlib.
if [ $INJECT_ZOS == true ] 
then
  zos push --deploy-stdlib --network $NETWORK --skip-compile
fi

# Create a proxy for the standard library's ERC721 token.
echo "Using Basil proxy deployed at: "$BASIL
zos create MintableERC721Token --from $OWNER --args $BASIL,BasilToken,BSL --network $NETWORK

# Read deployed addresses
ERC721=$(jq ".proxies.MintableERC721Token[0].address" package.zos.$NETWORK.json)
echo "Token deployed at: "$ERC721

# Register the token in Basil.
echo "Registering token in Basil..."
echo "BasilERC721.at(\"$BASIL\").setToken($ERC721, {from: \"$OWNER\"})" | truffle console --network $NETWORK

# Disable command logging
set +x
