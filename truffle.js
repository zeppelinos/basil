require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    local: {
      name: "local",
      host: 'localhost',
      port: 8545,
      network_id: '*',
      from: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
    },
    ropsten: {
      name: "ropsten",
      host: 'localhost',
      port: 8565,
      network_id: 3,
      gas: 3000000,
      from: "0x09902a56d04a9446601a0d451e07459dc5af0820"
    }
  }
};

// Utility to expose 'from' addresses
(function echoAddress() {
  const network = process.argv[2]
  if(module.exports.networks[network]) {
    process.stdout.write(module.exports.networks[network].from)
  }
})();
