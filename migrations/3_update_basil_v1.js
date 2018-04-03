const Registry = artifacts.require('zos-core/contracts/Registry.sol');
const OwnedUpgradeabilityProxy = artifacts.require('zos-core/contracts/upgradeability/OwnedUpgradeabilityProxy.sol');
const Basil = artifacts.require("./Basil.sol");

const colors = require('colors');
const fs = require('fs');


module.exports = async function(deployer, network, accounts) {
  console.log(colors.yellow(colors.inverse(`Running migration 3 in network: ${network}`)));
  const path = `./migrations/deploy_data.${network}.json`;

  deployer.then(async () => {
    
    const deployedData = retrieveDeployedData();
    const proxy = await retrieveDeployedProxy(deployedData)
    const registry = await retrieveDeployedRegistry(proxy);

    // Deploy basil's second implementation and register it.
    const version = '1';
    const implementation = await deployImplementation();
    await registerImplementation(registry, version, implementation);
    
    // Update proxy to use this new version.
    await upgradeProxy(proxy, version);
    
    // Store proxy data for selected network.
    writeDeployData(deployedData, version, implementation);
  });

  function writeDeployData(data, version, implementation) {
    data.deployedVersions[version] = implementation.address;
    const writeData = JSON.stringify(data, null, 2);
    console.log(colors.green(`> storing deploy data.`));
    fs.writeFileSync(path, writeData, 'utf8')
  }

  function upgradeProxy(proxy, version) {
    return new Promise(async resolve => {
      console.log(colors.gray(`> upgrading proxy to version ${version}`));
      await proxy.upgradeTo(version);
      console.log(colors.cyan(`> proxy upgraded to version ${await proxy.version()}, with implementation: ${await proxy.implementation()}`));
      resolve();
    });
  }

  function registerImplementation(registry, version, implementation) {
    return new Promise(async resolve => {
      console.log(colors.gray(`> registering version: ${version}...`));
      await registry.addVersion(version, implementation.address);
      console.log(colors.gray(`> registered version ${version}, implementation: ${await registry.getVersion(version)}`));
      resolve();
    });
  }

  function deployImplementation() {
    return new Promise(async resolve => {
      console.log(colors.cyan(`> deploying Basil implementation...`));
      const implementation = await Basil.new();
      console.log(colors.gray(`> implementation deployed: ${implementation.address}`));
      resolve(implementation);
    });
  }

  function retrieveDeployedRegistry(proxy) {
    return new Promise(async resolve => {
      const registryAddress = await proxy.registry();
      console.log(colors.gray(`> retrieving registry at: ${registryAddress}`));
      const registry = Registry.at(registryAddress);
      resolve(registry);
    });
  }

  function retrieveDeployedProxy(deployData) {
    return new Promise(async resolve => {
      const proxyAddress = deployData.proxyAddress;
      if(!proxyAddress) return;             
      console.log(colors.gray(`> retrieving proxy at: ${proxyAddress}`));
      const proxy = OwnedUpgradeabilityProxy.at(proxyAddress);
      resolve(proxy);
    });
  }

  function retrieveDeployedData() {
    let data; 
    try { 
      data = JSON.parse(fs.readFileSync(path, 'utf8'));
    }
    catch(err) {
      console.log(colors.red(err));
      return;
    };
    return data;
  }
}
