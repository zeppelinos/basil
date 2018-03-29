const Registry = artifacts.require('zos-core/contracts/Registry.sol');
const Factory = artifacts.require('zos-core/contracts/Factory.sol');
const Basil = artifacts.require("./Basil.sol");

const fs = require('fs');
const data = require('../data/deploy_data.json');

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {

    // Deploy the version registry.
    console.log(`> deploying registry`);
    const registry = await Registry.new();
    console.log(`> registry deployed: ${registry.address}`);

    // Deploy the proxy factory.
    console.log(`> deploying factory`);       
    const factory = await Factory.new(registry.address);
    console.log(`> factory deployed: ${registry.address}, with registry: ${await factory.registry()}`);
                                              
    // Deploy basil's first implementation and register it.
    const version = '0';                      
    console.log(`> deploying Basil implementation version ${version}`);
    const implementation = await Basil.new();
    console.log(`> implementation deployed: ${implementation.address}`);
    await registry.addVersion(version, implementation.address);
    console.log(`> registered version ${version}, implementation: ${await registry.getVersion(version)}`);
                                                      
    // Create the proxy with the first implementation, and execute
    // the implementation's initialze function.       
    const owner = accounts[0];                        
    const initializeData = implementation.contract.initialize.getData(owner);
    console.log(`> creating proxy with owner ${owner}, and call data: ${initializeData}`);
    const proxyData = await factory.createProxyAndCall('0', initializeData, { from: owner })
    console.log(`> proxy creation tx: ${proxyData.tx}`);
    const proxyAddress = proxyData.logs[0].args.proxy;
    console.log(`> proxy deployed: ${proxyAddress}`);
                                        
    // Verify proxy.                    
    const basil_v0 = await Basil.at(proxyAddress);
    console.log(`> proxy owner: ${await basil_v0.owner()}`);
                                        
    // Store proxy data for selected network.
    data[network].proxyAddress = proxyAddress;
    data[network].factoryAddress = factory.address;
    data[network].registryAddress = registry.address;
    const writeData = JSON.stringify(data, null, 2);
    console.log(`> storing deploy data: ${writeData}`);
    fs.writeFileSync('./data/deploy_data.json', writeData, 'utf8')
  });
};
