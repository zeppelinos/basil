'use strict';

const decodeLogs = require('zos-core/test/helpers/decodeLogs')

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
        this.basilImplementation0 = await Basil.new();
        await this.registry.addImplementation('0', contractName, this.basilImplementation0.address);
        const registryImplementation = await this.registry.getImplementation('0', contractName);
        assert.equal(registryImplementation, this.basilImplementation0.address);
      });

      it('can add implementation 1', async function() {
        this.basilImplementation1 = await BasilTestUpgrade.new();
        await this.registry.addImplementation('1', contractName, this.basilImplementation1.address);
        const registryImplementation = await this.registry.getImplementation('1', contractName);
        assert.equal(registryImplementation, this.basilImplementation1.address);
      });
      
      describe('controller', function() {
      
        it('knows of implementation 0', async function() {
          const controllerImplementation = await this.controller.getImplementation(projectName, '0', contractName);
          assert.equal(controllerImplementation, this.basilImplementation0.address);
        });
        
        it('knows of implementation 1', async function() {
          const controllerImplementation = await this.controller.getImplementation(projectName, '1', contractName);
          assert.equal(controllerImplementation, this.basilImplementation1.address);
        });

        it('can create a proxy for implementation 0', async function() {
          const initData = this.basilImplementation0.contract.initialize.getData(owner);
          const { receipt } = await this.controller.createAndCall(projectName, '0', contractName, initData);
          const logs = decodeLogs([receipt.logs[0]], UpgradeabilityProxyFactory, this.factory.address);
          const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy
          this.basilProxy = await OwnedUpgradeabilityProxy.at(proxyAddress)
          assert.equal(await this.basilProxy.implementation(), this.basilImplementation0.address);
        });

        it('can upgrade the proxy to implementation 1', async function() {
          await this.controller.upgradeTo(this.basilProxy.address, projectName, '1', contractName);
          assert.equal(await this.basilProxy.implementation(), this.basilImplementation1.address);
          const basil_v1 = await BasilTestUpgrade.at(this.basilProxy.address);
          const msg = await basil_v1.sayHi();
          assert.equal(msg, "Hi!");
        });
      });
    });

    // describe('upgrading', function () {

      // it('registers an update to the implementation', async function() {
//t
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
