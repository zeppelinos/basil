const fs = require('fs');

const DeployData = {

  deployPath(network) {
    return `./deploy/deploy_data.${network}.json`;
  },

  read(network) {
    let data;
    try { data = JSON.parse(fs.readFileSync(this.deployPath(network), 'utf8')); }
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
  }
}

export default DeployData;
