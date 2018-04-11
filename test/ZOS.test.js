'use strict';

const Basil = artifacts.require('Basil')
const BasilTestUpgrade = artifacts.require('BasilTestUpgrade.sol')
const Registry = artifacts.require('zos-core/contracts/Registry.sol')
const UpgradeabilityProxyFactory = artifacts.require('zos-core/contracts/upgradeability/UpgradeabilityProxyFactory.sol')
const ProjectController = artifacts.require('zos-core/contracts/ProjectController')
const OwnedUpgradeabilityProxy = artifacts.require("zos-core/contracts/upgradeability/OwnedUpgradeabilityProxy.sol");

contract('ZOS', ([_, proxyOwner, owner, aWallet, someone, anotherone]) => {

  describe.only('ProjectController', function() {

    const projectName = 'TheBasilProject';
    const contractName = 'Basil';

    before(async function () {
      this.registry = await Registry.new();
      this.factory = await UpgradeabilityProxyFactory.new();
      this.fallbackProvider = {address: "0x0"}; // TODO: A deployed version of zos should go here.
      this.controller = await ProjectController.new(projectName, this.registry.address, this.factory.address, this.fallbackProvider.address);
    });

    describe('registry', function() {

      it('is the assigned registry', async function() {
        const registry = await this.controller.registry();
        assert.equal(registry, this.registry.address);
      });

      it('can add implementation 0', async function() {
        this.implementation0 = await Basil.new();
        await this.registry.addImplementation('0', contractName, this.implementation0.address);
        const registryImplementation = await this.registry.getImplementation('0', contractName);
        assert.equal(registryImplementation, this.implementation0.address);
      });

      describe('controller', function() {
      
        it('knows of implementation 0', async function() {
          const controllerImplementation = await this.controller.getImplementation(projectName, '0', contractName);
          assert.equal(controllerImplementation, this.implementation0.address);
        });

        it('can create a proxy for implementation 0', async function() {
          const initData = this.implementation0.contract.initialize.getData(owner);
          const proxyData = await this.controller.createAndCall(projectName, '0', contractName, initData);
          const proxyAddress = proxyData.logs[0].args.proxy;
          this.basilProxy = await OwnedUpgradeabilityProxy.at(this.proxyAddress)
          assert.equal(this.basilProxy.implementation(), this.implementation0.address);
        });
      });
    });

    // describe('upgrading', function () {

      // it('registers an update to the implementation', async function() {
//
        // const behavior = await BasilTestUpgrade.new();
        // this.registry.addImplementation('1', this.contractName, behavior.address);
//
        // await this.controller.upgradeTo(this.proxy.address, this.projectName, '1', this.contractName, {from: proxyOwner});
        // assert.equal(await this.proxy.version(), '1');
        // assert.equal(await this.proxy.implementation(), behavior.address);
//
        // const basil_v1 = await BasilTestUpgrade.at(this.proxy.address);
        // const msg = await basil_v1.sayHi();
        // assert.equal(msg, "Hi!");
      // })

    // })
  })
})
