'use strict';

import Deployer from 'kernel/deploy/objects/Deployer';

const decodeLogs = require('zos-core/test/helpers/decodeLogs')

const Basil = artifacts.require('Basil')
const BasilTestUpgrade = artifacts.require('BasilTestUpgrade.sol')
const ProjectController = artifacts.require('zos-core/contracts/ProjectController')
const OwnedUpgradeabilityProxy = artifacts.require("zos-core/contracts/upgradeability/OwnedUpgradeabilityProxy.sol");

contract('ZOS', ([_, proxyOwner, owner, aWallet, someone, anotherone]) => {

  describe.only('ProjectController', function() {

    const projectName = 'TheBasilProject';
    const contractName = 'Basil';

    before(async function () {
      this.controller = await Deployer.projectController(proxyOwner, projectName);
    });

    describe('registry', function() {

      it('can add implementation 0', async function() {
        this.basilImplementation0 = await Deployer.deployAndRegister(this.controller, Basil, contractName, '0');
      });

      it('can add implementation 1', async function() {
        this.basilImplementation1 = await Deployer.deployAndRegister(this.controller, BasilTestUpgrade, contractName, '1');
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
          this.basilProxy = await Deployer.createProxyAndCall(
            this.controller,
            proxyOwner,
            Basil,
            contractName,
            projectName,
            '0',
            ['address'],
            proxyOwner
          );
        });

        it('can upgrade the proxy to implementation 1', async function() {
          await this.controller.upgradeTo(this.basilProxy.address, projectName, '1', contractName, {from: proxyOwner});
          const proxy = OwnedUpgradeabilityProxy.at(this.basilProxy.address);
          assert.equal(await proxy.implementation(), this.basilImplementation1.address);
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
