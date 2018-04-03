var Migrations = artifacts.require("./Migrations.sol");

const colors = require('colors');

module.exports = function(deployer, network, accounts) {
  console.log(colors.yellow(colors.inverse(`Running migration 1 in network: ${network}`)));
  console.log(colors.cyan(`> deploying migrations`));
  deployer.deploy(Migrations);
};
