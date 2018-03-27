const Registry = artifacts.require('zos-core/contracts/Registry.sol');
const Factory = artifacts.require('zos-core/contracts/Factory.sol');
const Basil = artifacts.require("./Basil.sol");

const abi = require('ethereumjs-abi')

module.exports = async function(deployer, network, accounts) {

  // Deploy the upgradeability wrappers.
  const registry = await Registry.new();
  const factory = await Factory.new(registry.address);

  // Deploy basil's first implementation and register it.
  const implementation = await Basil.new();
  await registry.addVersion('0', implementation.address);

  // Create the proxy with the first implementation, and execute
  // the implementation's initialze function.
  const owner = accounts[0];
  const methodId = abi.methodID('initialize', ['address']).toString('hex');
  const params = abi.rawEncode(['address'], [owner]).toString('hex');
  const initializeData = '0x' + methodId + params;
  const proxyData = await factory.createProxyAndCall('0', initializeData, { from: owner })
  const proxyAddress = proxyData.logs[0].args.proxy;
  await Basil.at(proxyAddress)
};
