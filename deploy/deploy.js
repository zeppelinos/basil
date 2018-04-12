
import DeployData from './deploy_data_util.js';
import Deployer from 'kernel/deploy/objects/Deployer';

const Basil = artifacts.require("./Basil.sol");
const ProjectController = artifacts.require('ProjectController');

const PROJECT_OWNER = web3.eth.accounts[0];
const PROJECT_NAME = 'TheBasil';

const data = DeployData.read(network);

let controller;
// let registry;

async function deploy() {
  await deployController();
  await deployBasil();
}

async function deployBasil() {
  const contractName = 'Basil';
  if(!data.contracts || !data.contracts[contractName]) {

    // Register first implementation.
    const version = '0';
    console.log(`deploying and registering first implementation of ${contractName}...`);
    const implementation = await Deployer.deployAndRegister(controller, Basil, contractName, version);
    console.log(`first implementation deployed, version: ${version}, at: ${implementation.address}`);

    // Create proxy with first implementation.
    console.log(`creating proxy for ${contractName}...`);
    const proxy = await Deployer.createProxyAndCall(
      controller,
      PROJECT_OWNER,
      Basil,
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
        '0': implementation.address
      }
    };
    DeployData.write(data, network);
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
    DeployData.write(data, network);
  }
  else {

    // Retrieve project controller.
    console.log(`found project controller, reusing it...`);
    controller = await ProjectController.at(data.controllerAddress);
    console.log(`retrieved project controller: ${controller.address}`);
  }
}

module.exports = function(cb) {
  deploy().then(cb).catch(cb);
}
