
import DeployData from './deploy_data_util.js';
import Deployer from 'kernel/deploy/objects/Deployer';

const Basil = artifacts.require("./Basil.sol");
const BasilERC721 = artifacts.require("./BasilERC721.sol");
const ProjectController = artifacts.require('ProjectController');

const PROJECT_OWNER = web3.eth.accounts[0];
const PROJECT_NAME = 'TheBasil';
const BASIL_CONTRACT_NAME = 'Basil';

let data;
let controller;
let basilProxy;

const ZOS_ADDRESS = {
  development: 0x7aed345f11e9d4fe148a9ef27fc45be0ca20fb3b,
  ropsten: 0x0
}

async function deploy() {
  data = DeployData.read(network);
  await deployController();
  await deployBasil();
  await deployBasilERC721();
}

async function deployBasil() {
  const version = '0';
  if(!data.contracts || !data.contracts[BASIL_CONTRACT_NAME]) {

    // Deploy and register implementation.
    console.log(`deploying and registering version ${version} of ${BASIL_CONTRACT_NAME}...`);
    const implementation = await Deployer.deployAndRegister(controller, Basil, BASIL_CONTRACT_NAME, version);
    console.log(`implementation deployed, version: ${version}, at: ${implementation.address}`);

    // Create proxy with first implementation.
    console.log(`creating proxy for ${BASIL_CONTRACT_NAME}...`);
    basilProxy = await Deployer.createProxyAndCall(
      controller,
      PROJECT_OWNER,
      Basil,
      BASIL_CONTRACT_NAME,
      PROJECT_NAME,
      version,
      ['address'],
      [PROJECT_OWNER]
    );
    console.log(`deployed proxy: ${basilProxy.address}`);

    // Save to disk.
    data = DeployData.saveContractProxy(data, BASIL_CONTRACT_NAME, basilProxy.address, network);
    data = DeployData.appendContractVersion(data, BASIL_CONTRACT_NAME, version, implementation.address, network);
  }
  else {
    // TODO: the fact that the version is not found in the json does not necessarily mean it is not
    // in the registry, which probably needs to be accounted for.
    console.log('found Basil version 0, no need to deploy it.');
  }
}

async function deployBasilERC721() {
  const version = '1';
  if(!data.contracts.Basil.versions[version]) {

    // Deploy and register implementation.
    console.log(`deploying and registering version ${version} of ${BASIL_CONTRACT_NAME}...`);
    const implementation = await Deployer.deployAndRegister(controller, BasilERC721, BASIL_CONTRACT_NAME, version);
    console.log(`implementation deployed, version: ${version}, at: ${implementation.address}`);

    // Upgrade proxy.
    controller.upgradeTo(basilProxy.address, PROJECT_NAME, version, BASIL_CONTRACT_NAME);
    console.log(`upgraded ${BASIL_CONTRACT_NAME} proxy to version ${version}`);

    // Save to disk.
    DeployData.appendContractVersion(data, BASIL_CONTRACT_NAME, version, implementation.address, network);
  }
  else {
    // Tregistering versions in basil deploy can be abstracted to base functionODO: the fact that the version is not found in the json does not necessarily mean it is not
    // in the registry, which probably needs to be accounted for.
    console.log('found Basil version 1, no need to deploy it.');
  }
}

async function deployController() {
  if(!data.controllerAddress) {

    // Deploy a new project controller.
    console.log(`did not find a project controller, deploying a new one...`);
    controller = await Deployer.projectController(
      PROJECT_OWNER,
      PROJECT_NAME,
      ZOS_ADDRESS[network]
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
