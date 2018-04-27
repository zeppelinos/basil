// 'use strict';

// import Deployer from 'kernel/deploy/objects/Deployer';

// const Basil = artifacts.require('Basil');
// const BasilTestUpgrade = artifacts.require('BasilTestUpgrade.sol');
// const ProjectController = artifacts.require('zos-core/contracts/ProjectController');
// const OwnedUpgradeabilityProxy = artifacts.require("zos-core/contracts/upgradeability/OwnedUpgradeabilityProxy.sol");
// const ZepCore = artifacts.require('kernel/contracts/ZepCore.sol');

// const ZOS_ADDRESS = "0x212fbf392206bca0a478b9ed3253b08559b35903";
// const ZEPPELIN_VERSION = '1.8.0';
// const ZEPPELIN_DISTRO = 'ZeppelinOS';

// contract('ZOS', ([_, proxyOwner, owner, aWallet, someone, anotherone]) => {

//   describe('ProjectController', function() {

//     const projectName = 'TheBasilProject';
//     const contractName = 'Basil';

//     before(async function () {
//       this.controller = await Deployer.projectController(proxyOwner, projectName, ZOS_ADDRESS);
//     });

//     describe('controller', function() {

//       it('has a valid fallback provider set', async function() {
//         const provider = await this.controller.fallbackProvider();
//         assert.equal(provider, ZOS_ADDRESS);
//       });
//     });

//     describe('ZepCore', function() {

//       it('has an implementation for ERC721Token', async function() {
//         const core = ZepCore.at(ZOS_ADDRESS);
//         const impl = await core.getImplementation(ZEPPELIN_DISTRO, ZEPPELIN_VERSION, 'ERC721Token');
//         assert.notEqual(impl, 0x0);
//       });
//     });

//     describe('registry', function() {

//       it('can add implementation 0', async function() {
//         this.basilImplementation0 = await Deployer.deployAndRegister(this.controller, Basil, contractName, '0');
//       });

//       it('can add implementation 1', async function() {
//         this.basilImplementation1 = await Deployer.deployAndRegister(this.controller, BasilTestUpgrade, contractName, '1');
//       });

//       describe('controller with registered implementations', function() {

//         it('knows of implementation 0', async function() {
//           const controllerImplementation = await this.controller.getImplementation(projectName, '0', contractName);
//           assert.equal(controllerImplementation, this.basilImplementation0.address);
//         });

//         it('knows of implementation 1', async function() {
//           const controllerImplementation = await this.controller.getImplementation(projectName, '1', contractName);
//           assert.equal(controllerImplementation, this.basilImplementation1.address);
//         });

//         it('can create a proxy for implementation 0', async function() {
//           this.basilProxy = await Deployer.createProxyAndCall(
//             this.controller,
//             proxyOwner,
//             Basil,
//             contractName,
//             projectName,
//             '0',
//             ['address'],
//             proxyOwner
//           );
//         });

//         it('can upgrade the proxy to implementation 1', async function() {
//           await this.controller.upgradeTo(this.basilProxy.address, projectName, '1', contractName, {from: proxyOwner});
//           const proxy = OwnedUpgradeabilityProxy.at(this.basilProxy.address);
//           assert.equal(await proxy.implementation(), this.basilImplementation1.address);
//           const basil_v1 = await BasilTestUpgrade.at(this.basilProxy.address);
//           const msg = await basil_v1.sayHi();
//           assert.equal(msg, "Hi!");
//         });
//       });
//     });
//   })
// })
