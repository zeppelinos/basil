const Registry = artifacts.require('zos-core/contracts/Registry.sol');
const OwnedUpgradeabilityProxy = artifacts.require('zos-core/contracts/upgradeability/OwnedUpgradeabilityProxy.sol');
const Basil = artifacts.require("./Basil.sol");

const data = require('./deploy_data.json');
const colors = require('colors');
const fs = require('fs');

module.exports = async function(deployer, network, accounts) {
  deployer.then(async () => {
    
    // Greeter.
    console.log(colors.yellow(colors.inverse(`Running migration 3 in network: ${network}`)));
    
    // Retrieve proxy.                    
    const proxyAddress = data[network].proxyAddress;
    if(!proxyAddress) return;             
    console.log(colors.gray(`> retrieving proxy at: ${proxyAddress}`));
    const proxy = OwnedUpgradeabilityProxy.at(proxyAddress);

    // Retrieve registry.
    const registryAddress = await proxy.registry();
    console.log(colors.gray(`> retrieving registry at: ${registryAddress}`));
    const registry = Registry.at(registryAddress);

    // Deploy the new implementation.
    const version = '1';
    console.log(colors.cyan(`> deploying Basil implementation version ${version}`));
    const implementation = await Basil.new();
    console.log(colors.gray(`> implementation deployed: ${implementation.address}`));

    // Upload new implementation to the registry.
    await registry.addVersion(version, implementation.address);
    console.log(colors.gray(`> registered version ${version}, implementation: ${await registry.getVersion(version)}`));

    // Update proxy to use this new version.
    const owner = accounts[0];                        
    console.log(colors.gray(`> upgrading proxy to version ${version}`));
    await proxy.upgradeTo(version);
    console.log(colors.cyan(`> proxy upgraded to version ${await proxy.version()}, with implementation: ${await proxy.implementation()}`));
    
    // Store proxy data for selected network.
    data[network].deployedVersions[version] = implementation.address;
    const writeData = JSON.stringify(data, null, 2);
    console.log(colors.green(`> storing deploy data.`));
    fs.writeFileSync('./migrations/deploy_data.json', writeData, 'utf8')
  });
}







                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
