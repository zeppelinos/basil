require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    local: {
      name: "local",
      host: 'localhost',
      port: 8545,
      network_id: '*',
      from: "0xffcf8fdee72ac11b5c542428b35eef5769c409f0"
    },
    ropsten: {
      name: "ropsten",
      host: 'localhost',
      port: 8565,
      network_id: 3,
      gas: 3000000,
      gasPrice: 22000000000,
      from: "0x09902a56d04a9446601a0d451e07459dc5af0820"
    },
    rinkeby: {
      name: "rinkeby",
      host: '192.168.1.136',
      port: 8545,
      network_id: 4,
      gas: 3000000,
      gasPrice: 22000000000,
      from: "0x497DF73B8876605c56493DF94B9BDCef6Bf9b0C6"
    },
    mainnet: {
      name: "mainnet",
      host: 'localhost',
      port: 8546,
      network_id: 1,
      gas: 7000000,
      gasPrice: 20000000000,
      from: "0x6bf917b4725ad736b33dbd493ad7a4b992150dab"
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
