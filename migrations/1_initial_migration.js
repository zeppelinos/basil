var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
  console.log(`> deploying migrations`);
  deployer.deploy(Migrations);
};
