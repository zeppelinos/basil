const colors = require('colors');
const fs = require('fs');

class DeployUtil {

  constructor(_artifacts, _network, _accounts) {

    this.deployDataPath = `./migrations/deploy_data.${_network}.json`;

    this.artifacts = _artifacts;
    this.network = _network;
    this.accounts = _accounts;

    this.logImportant(`Running migration in network: ${_network}`);
  }

  deployRegistry() {
    return new Promise(async resolve => {
      const Registry = this.artifacts.require('zos-core/contracts/Registry.sol');
      this.logInfo(`> deploying registry`);
      const registry = await Registry.new();
      this.logMinor(`> registry deployed: ${registry.address}`);
      resolve(registry);
    });
  }

  deployFactory(registry) {
    return new Promise(async resolve => {
      const Factory = this.artifacts.require('zos-core/contracts/Factory.sol');
      this.logInfo(`> deploying factory`);       
      const factory = await Factory.new(registry.address);
      this.logMinor(`> factory deployed: ${registry.address}, with registry: ${await factory.registry()}`);
      resolve(factory);
    });
  }

  deployImplementation(truffleArtifacts) {
    return new Promise(async resolve => {
      this.logInfo(`> deploying Basil implementation...`);
      const implementation = await truffleArtifacts.new();
      this.logMinor(`> implementation deployed: ${implementation.address}`);
      resolve(implementation);
    });
  }

  registerImplementation(registry, version, implementation) {
    return new Promise(async resolve => {
      this.logMinor(`> registering version: ${version}...`);
      await registry.addVersion(version, implementation.address);
      this.logMinor(`> registered version ${version}, implementation: ${await registry.getVersion(version)}`);
      resolve();
    });
  }

  upgradeProxy(proxy, version) {
    return new Promise(async resolve => {
      this.logMinor(`> upgrading proxy to version ${version}`);
      await proxy.upgradeTo(version);
      this.logInfo(`> proxy upgraded to version ${await proxy.version()}, with implementation: ${await proxy.implementation()}`);
      resolve();
    });
  }

  createProxyWithCall(factory, version, implementation, callData, callProps) {
    return new Promise(async resolve => {
      const proxyData = await factory.createProxyAndCall(version, callData, callProps);
      this.logMinor(`> proxy creation tx: ${proxyData.tx}`);
      const proxyAddress = proxyData.logs[0].args.proxy;
      this.logMinor(`> proxy deployed: ${proxyAddress}`);
      resolve(proxyAddress);
    });
  }

  retrieveDeployedProxy(deployData) {
    return new Promise(async resolve => {
      const proxyAddress = deployData.proxyAddress;
      if(!proxyAddress) return;             
      this.logMinor(`> retrieving proxy at: ${proxyAddress}`);
      const OwnedUpgradeabilityProxy = this.artifacts.require('zos-core/contracts/upgradeability/OwnedUpgradeabilityProxy.sol');
      const proxy = OwnedUpgradeabilityProxy.at(proxyAddress);
      resolve(proxy);
    });
  }

  retrieveDeployedRegistry(proxy) {
    return new Promise(async resolve => {
      const registryAddress = await proxy.registry();
      this.logMinor(`> retrieving registry at: ${registryAddress}`);
      const Registry = this.artifacts.require('zos-core/contracts/Registry.sol');
      const registry = Registry.at(registryAddress);
      resolve(registry);
    });
  }

  readDeployData() {
    let data; 
    try { 
      data = JSON.parse(fs.readFileSync(this.deployDataPath, 'utf8'));
    } 
    catch(err) {
      data = {
        proxyAddress: '',
        deployedVersions: {}
      };
    };
    return data;
  }
  
  writeDeployData(version, implementation, proxyAddress) {
    const data = this.readDeployData();
    data.proxyAddress = proxyAddress;
    data.deployedVersions[version] = implementation.address;
    const writeData = JSON.stringify(data, null, 2);
    this.logSuccess(`> storing deploy data.`);
    fs.writeFileSync(this.deployDataPath, writeData, 'utf8');
  }

  logImportant(msg) { console.log(colors.yellow(colors.inverse(msg))); }
  logInfo(msg) { console.log(colors.cyan(msg)); }
  logMinor(msg) { console.log(colors.gray(msg)); }
  logSuccess(msg) { console.log(colors.green(msg)); }
}

module.exports = DeployUtil;
