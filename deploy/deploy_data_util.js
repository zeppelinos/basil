const fs = require('fs');

const DeployData = {

  deployPath(network) {
    return `./deploy/deploy_data.${network}.json`;
  },

  read(network) {
    let data;
    const path = this.deployPath(network);
    try {
      const raw = fs.readFileSync(path, 'utf8');
      data = JSON.parse(raw);
    }
    catch(err) {
      data = {
        controllerAddress: undefined,
        contracts: {}
      };
    };
    return data;
  },

  write(data, network) {
    const writeData = JSON.stringify(data, null, 2);
    const path = this.deployPath(network);
    fs.writeFileSync(path, writeData, 'utf8');
  },

  saveController(data, network, controllerAddress) {
    data.controllerAddress = controllerAddress;
    this.write(data, network);
    return data;
  },

  saveContractProxy(data, contractName, proxyAddress, network) {
    data = this.prepareContractEntry(data, contractName);
    data.contracts[contractName].proxyAddress = proxyAddress;
    this.write(data, network);
    return data;
  },

  appendContractVersion(data, contractName, version, implementation, network) {
    data = this.prepareContractEntry(data, contractName);
    data.contracts[contractName].versions[version] = implementation;
    this.write(data, network);
    return data;
  },

  prepareContractEntry(data, contractName) {
    if(!data.contracts) data.contracts = {};
    if(data.contracts[contractName]) return data;
    data.contracts[contractName] = {
      proxyAddress: undefined,
      versions: {}
    };
    return data;
  }
}

export default DeployData;
