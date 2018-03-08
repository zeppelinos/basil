require('babel-register');
require('babel-polyfill');

module.exports = {
  mocha: {
    bail: true,
    logs: true,
  },
  networks: {
    ropsten: {
      host: 'localhost',
      port: 8545,
      network_id: 3,
    },
    test: {
      host: 'localhost',
      port: 9545,
      network_id: 3,
    }
  }
};
