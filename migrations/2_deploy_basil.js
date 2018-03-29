const Registry = artifacts.require('zos-core/contracts/Registry.sol');
const Factory = artifacts.require('zos-core/contracts/Factory.sol');
const Basil = artifacts.require("./Basil.sol");

const colors = require('colors');
const fs = require('fs');
const data = require('../data/deploy_data.json');

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {

    // Deploy the version registry.
    console.log(colors.cyan(`> deploying registry`));
    const registry = await Registry.new();
    console.log(colors.gray(`> registry deployed: ${registry.address}`));

    // Deploy the proxy factory.
    console.log(colors.cyan(`> deploying factory`));       
    const factory = await Factory.new(registry.address);
    console.log(colors.gray(`> factory deployed: ${registry.address}, with registry: ${await factory.registry()}`));
                                              
    // Deploy basil's first implementation and register it.
    const version = '0';                      
    console.log(colors.cyan(`> deploying Basil implementation version ${version}`));
    const implementation = await Basil.new();
    console.log(colors.gray(`> implementation deployed: ${implementation.address}`));
    await registry.addVersion(version, implementation.address);
    console.log(colors.gray(`> registered version ${version}, implementation: ${await registry.getVersion(version)}`));
                                                      
    // Create the proxy with the first implementation, and execute
    // the implementation's initialze function.       
    const owner = accounts[0];                        
    const initializeData = implementation.contract.initialize.getData(owner);
    console.log(colors.cyan(`> creating proxy with owner ${owner}, and call data: ${initializeData}`));
    const proxyData = await factory.createProxyAndCall('0', initializeData, { from: owner })
    console.log(colors.gray(`> proxy creation tx: ${proxyData.tx}`));
    const proxyAddress = proxyData.logs[0].args.proxy;
    console.log(colors.gray(`> proxy deployed: ${proxyAddress}`));
                                        
    // Verify proxy.                    
    const basil_v0 = await Basil.at(proxyAddress);
    console.log(colors.gray(`> proxy owner: ${await basil_v0.owner()}`));
                                        
    // Store proxy data for selected network.
    data[network].proxyAddress = proxyAddress;
    data[network].factoryAddress = factory.address;
    data[network].registryAddress = registry.address;
    const writeData = JSON.stringify(data, null, 2);
    console.log(colors.green(`> storing deploy data: ${writeData}`));
    fs.writeFileSync('./data/deploy_data.json', writeData, 'utf8')
  });
};
