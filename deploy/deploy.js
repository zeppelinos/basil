import DeployData from './deploy_data_util.js';
import Deployer from 'kernel/deploy/objects/Deployer';
import RegistryManager from 'kernel/deploy/objects/RegistryManager';
import ProjectControllerManager from 'kernel/deploy/objects/ProjectControllerManager';

const Registry = artifacts.require("./Registry");
const Basil = artifacts.require("./Basil.sol");
const ProjectController = artifacts.require('ProjectController');

const PROJECT_OWNER = web3.eth.accounts[0];
const PROJECT_NAME = 'TheBasil';

const data = DeployData.readData(network);

let controller;
let registry;

async function deploy() {
  await deployController();
  await deployBasil();
}

async function deployBasil() {
  const contractName = 'Basil';
  if(!data.contracts || !data.contracts[contractName]) {

    // Register first implementation.
    const version = '0';
    const Contract = Basil;
    const registryManager = new RegistryManager(registry);
    console.log(`deploying and registering first implementation of ${contractName}...`);
    await registryManager.deployAndRegister(Contract, contractName, version);
    const implementationAddress = await registry.getImplementation(version, contractName);
    console.log(`first implementation deployed, version: ${version}, at: ${implementationAddress}`);

    // Create proxy with first implementation.
    const projectControllerManager = new ProjectControllerManager(controller, PROJECT_OWNER);
    console.log(`creating proxy for ${contractName}...`);
    const proxy = await projectControllerManager.createProxyAndCall(
      Contract,
      contractName,
      PROJECT_NAME,
      version,
      ['address'],
      [PROJECT_OWNER]
    );
    console.log(`deployed proxy: ${proxy.address}`);

    // Save to disk.
    if(!data.contracts) data.contracts = {};
    data.contracts[contractName] = {
      proxyAddress: proxy.address,
      versions: {
        '0': implementationAddress
      }
    };
    DeployData.writeData(data, network);
  }
}

async function deployController() {
  if(!data.controllerAddress) {

    // Deploy a new project controller.
    console.log(`did not find a project controller, deploying a new one...`);
    controller = await Deployer.projectController(
      PROJECT_OWNER,
      PROJECT_NAME
    );
    console.log(`deployed new project controller: ${controller.address}`);

    // Save to disk.
    data.controllerAddress = controller.address;
    DeployData.writeData(data, network);
  }
  else {

    // Retrieve project controller.
    console.log(`found project controller, reusing it...`);
    controller = await ProjectController.at(data.controllerAddress);
    console.log(`retrieved project controller: ${controller.address}`);
  }

  // Retrieve controller registry.
  registry = Registry.at(await controller.registry());
}

module.exports = function(cb) {
  deploy().then(cb).catch(cb);
}
