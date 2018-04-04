const Basil = artifacts.require("./Basil.sol");
const DeployUtil = require('./deploy_util.js');

module.exports = function(deployer, network, accounts) {

  const util = new DeployUtil(artifacts, network, accounts);

  deployer.then(async () => {

    const registry = await util.deployRegistry();
    const factory = await util.deployFactory(registry);

    // Deploy basil's first implementation and register it.
    const version = '0';    
    const implementation = await util.deployImplementation(Basil);
    await util.registerImplementation(registry, version, implementation);

    // Create the proxy with the first implementation, and execute
    // the implementation's initialze function.       
    const owner = accounts[0];                        
    const initializeData = implementation.contract.initialize.getData(owner);
    util.logInfo(`> creating proxy with owner ${owner}, and call data: ${initializeData}`);
    const proxyAddress = await util.createProxyWithCall(factory, version, implementation, initializeData, { from: owner });

    // Verify proxy.                    
    const basil_v0 = await Basil.at(proxyAddress);
    util.logMinor(`> proxy owner: ${await basil_v0.owner()}`);

    // Store proxy data for selected network.
    util.writeDeployData(version, implementation, proxyAddress);
  });
};
