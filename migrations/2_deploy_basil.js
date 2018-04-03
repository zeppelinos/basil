const Registry = artifacts.require('zos-core/contracts/Registry.sol');
const Factory = artifacts.require('zos-core/contracts/Factory.sol');
const Basil = artifacts.require("./Basil.sol");

const colors = require('colors');
const fs = require('fs');

module.exports = function(deployer, network, accounts) {
  console.log(colors.yellow(colors.inverse(`Running migration 2 in network: ${network}`)));

  deployer.then(async () => {

    const registry = await deployRegistry();
    const factory = await deployFactory(registry);

    // Deploy basil's first implementation and register it.
    const version = '0';    
    const implementation = await deployImplementation();
    await registerImplementation(registry, version, implementation);

    // Create the proxy with the first implementation, and execute
    // the implementation's initialze function.       
    const proxyAddress = await createProxyWithFirstImplementation(factory, version, implementation);

    // Verify proxy.                    
    const basil_v0 = await Basil.at(proxyAddress);
    console.log(colors.gray(`> proxy owner: ${await basil_v0.owner()}`));

    // Store proxy data for selected network.
    writeDeployData(version, implementation, proxyAddress);
  });

  function deployRegistry() {
    return new Promise(async resolve => {
      console.log(colors.cyan(`> deploying registry`));
      const registry = await Registry.new();
      console.log(colors.gray(`> registry deployed: ${registry.address}`));
      resolve(registry);
    });
  }

  function deployFactory(registry) {
    return new Promise(async resolve => {
      console.log(colors.cyan(`> deploying factory`));       
      const factory = await Factory.new(registry.address);
      console.log(colors.gray(`> factory deployed: ${registry.address}, with registry: ${await factory.registry()}`));
      resolve(factory);
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

  function registerImplementation(registry, version, implementation) {
    return new Promise(async resolve => {
      console.log(colors.gray(`> registering version: ${version}...`));
      await registry.addVersion(version, implementation.address);
      console.log(colors.gray(`> registered version ${version}, implementation: ${await registry.getVersion(version)}`));
      resolve();
    });
  }

  function createProxyWithFirstImplementation(factory, version, implementation) {
    return new Promise(async resolve => {
      const owner = accounts[0];                        
      const initializeData = implementation.contract.initialize.getData(owner);
      console.log(colors.cyan(`> creating proxy with owner ${owner}, and call data: ${initializeData}`));
      const proxyData = await factory.createProxyAndCall(version, initializeData, { from: owner })
      console.log(colors.gray(`> proxy creation tx: ${proxyData.tx}`));
      proxyAddress = proxyData.logs[0].args.proxy;
      console.log(colors.gray(`> proxy deployed: ${proxyAddress}`));
      resolve(proxyAddress);
    });
  }

  function writeDeployData(version, implementation, proxyAddress) {
    const path = `./migrations/deploy_data.${network}.json`;
    let data; 
    try { 
      data = JSON.parse(fs.readFileSync(path, 'utf8'));
    } 
    catch(err) {

      // First time, create data schema.
      data = {
        proxyAddress: '',
        deployedVersions: {}
      };
    };
    data.proxyAddress = proxyAddress;
    data.deployedVersions[version] = implementation.address;
    const writeData = JSON.stringify(data, null, 2);
    console.log(colors.green(`> storing deploy data.`));
    fs.writeFileSync(path, writeData, 'utf8')
  }
};
