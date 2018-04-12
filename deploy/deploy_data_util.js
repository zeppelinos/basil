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
  }
}

export default DeployData;
