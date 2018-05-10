require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      name: "development",
      host: 'localhost',
      port: 8545,
      network_id: '*',
    },
    ropsten: {
      name: "ropsten",
      host: 'localhost',
      port: 8565,
      network_id: 3,
      gas: 3000000
    }
  }
};
