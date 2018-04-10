const Basil = artifacts.require("./Basil.sol");
const DeployUtil = require('./deploy_util.js');

module.exports = async function(deployer, network, accounts) {
  return; // TODO: remove after zos-core integration refactor and tests pass

  const util = new DeployUtil(artifacts, network, accounts);

  deployer.then(async () => {
    
    const deployedData = util.readDeployData();
    const proxy = await util.retrieveDeployedProxy(deployedData)
    const registry = await util.retrieveDeployedRegistry(proxy);

    // Deploy basil's second implementation and register it.
    const version = '1';
    const implementation = await util.deployImplementation(Basil);
    await util.registerImplementation(registry, version, implementation);
    
    // Update proxy to use this new version.
    await util.upgradeProxy(proxy, version);
    
    // Store proxy data for selected network.
    util.writeDeployData(version, implementation, proxy.address);
  });
}
