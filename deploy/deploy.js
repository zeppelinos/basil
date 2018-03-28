
const prompt = require('prompt');
const colors = require('colors');
const Web3 = require("web3");
const figlet = require('figlet');
const TruffleContract = require('truffle-contract');

const deploy_data = require("./deploy_data.json");

let network;
let web3;

function welcomeMsg() {
  const fonts = [
    'Bloody',
    'ANSI Shadow',
    'Delta Corps Priest 1',
    'Electronic',
    'Elite',
    'Graffiti',
  ];
  const font = fonts[ Math.floor(fonts.length * Math.random()) ];
  console.log(
    colors.bold(
      colors.cyan(
        figlet.textSync(
          "zeppelin_os",
          { font }
        )
      )
    )
  );
  console.log(colors.red('<<< Deploy Util >>>'));
}

function connectNetwork() {
  return new Promise(async (resolve, reject) => {

    const providerUrl = `${network.host}:${network.port}`
    console.log(colors.gray(`conecting web3 to '${providerUrl}'...`));

    const provider = new Web3.providers.HttpProvider(providerUrl);
    web3 = new Web3(provider)

    web3.net.getListening((err, res) => {
      if(err) {
        console.log('error connecting web3:', err);
        reject()
        return
      }
      console.log(colors.gray(`web3 connected: ${res}\n`));
      resolve()
    });
  })
}

function selectNetwork() {

  // Assumes that a valid networks object exists, including
  // having at least one entry.

  const networks = deploy_data.networks;
  
  // Display available networks.
  console.log(colors.cyan("Available networks:"));
  for(let i = 0; i < networks.length; i++) {
    const aNetwork = networks[i];
    console.log(`${i + 1} - ${aNetwork.name}`);
  }

  return new Promise((resolve, reject) => {
    // If there is only one option skip prompt.
    if(networks.length == 1) {
      resolve(networks[0]);
    }
    else {

      // Prompt the user to select a network.
      prompt.start();
      prompt.get({properties: {
        selectedIndex: {
          description: `Please select a network: (1-${networks.length})`
        }}}, (err, res) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(networks[res.selectedIndex - 1]);
          }
      })
    }
  });
}

function getContractArtifacts(filename) {
  let artifacts;
  try {
    artifacts = require(`../build/contracts/${withoutExtension(filename)}`);
  }
  catch(error) {
    console.log(colors.red(`No compiled artifacts found for ${filename} - ${error}`));
  }
  return artifacts;
}

function getTruffleContract(filename) {
  const artifacts = getContractArtifacts(filename);
  const truffleContract = TruffleContract(artifacts);
  truffleContract.setProvider(web3);
  return truffleContract;
}

function deployNewContract(filename, args, props) {
  args ||= [];
  props ||= {};
  return new Promise((resolve, reject) => {
    const contract = getTruffleContract(filename).new(...args, props);
    resolve(contract);
  });
}

function getContractAt(filename, address) {
  return new Promise((resolve, reject) => {
    const contract = getTruffleContract(filename).at(address);
    resolve(contract);
  });
}

function withoutExtension(file) {
  return file.split('.')[0];
}

function isValidAddress(address) {
  if(!address) return false;
  if(address === '0x0000000000000000000000000000000000000000') return false;
  if(address.substring(0, 2) !== "0x") return false;

  // Basic validation: length, valid characters, etc
  if(!/^(0x)?[0-9a-f]{40}$/i.test(address)) return false;

  return true;
}

function getAddress(contracData, fieldName) {
  const deployData = contractData.networks[network.name];
  const address = deployData[fieldName];
  return isValidAddress(address) ? address : undefined;
}

function getProxy(contractData) {
  return new Promise((resolve, reject) => {
    const proxyAddress = getAddress(contractData, "proxyAddress");
    if(!proxyAddress) {
      const proxy = await deployProxy();
      resolve(proxy);
    }
    else {
      resolve(getContract(contracData.filename, proxyAddress));
    }
  });
}

function deployRegistryForContract(contractData) {
  return new Promise((resolve, reject) => {
    const registry = await deployNewContract("Registry");
    contractData.registryAddress = registry.address;
    // TODO: mark write data flag
    resolve(registry);
  });
}

function deployFactoryForContract(contractData) {
  return new Promise((resolve, reject) => {
    const registryAddress = getAddress(contractData, "registryAddress");
    const factory = await deployNewContract("Factory", [registryAddress]);
    // TODO: mark write data flag
    resolve(factory);
  });
}

async function checkContractForDeployment(contractData) {
  console.log(colors.cyan(contractData.filename));

  // Deploy registry.
  // TODO: reuse if existing
  const registry = await deployRegistryForContract(contracData);

  // Deploy factory.
  // TODO: reuse if existing.
  const factory = await deployFactoryForContract(contracData);

  // ...
}

async function execute() {

  welcomeMsg();

  // TODO: validate schema
  // Verify that networks exist, contracts exist, etc and notify user if problems exist, then exit.

  // Select a network.
  network = await selectNetwork();
  console.log(colors.cyan('Selected network:', network.name));

  // Connect to network.
  await connectNetwork();

  // Iterate contract entries and
  // check for necessary deployments.
  const contracts = deploy_data.contracts;
  for(let i = 0; i < contracts.length; i++) {
    const contractData = contracts[i];
    checkContractForDeployment(contractData);
  }
}
execute();
