
const prompt = require('prompt');
const colors = require('colors');
const Web3 = require("web3");
const figlet = require('figlet');
const TruffleContract = require('truffle-contract');
const abi = require('ethereumjs-abi')

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

function getAddress(contractData, fieldName) {
  const deployData = contractData.networks[network.name];
  const address = deployData[fieldName];
  return isValidAddress(address) ? address : undefined;
}

function getProxy(contractData) {
  return new Promise(async (resolve, reject) => {
    const proxyAddress = getAddress(contractData, "proxyAddress");
    if(!proxyAddress) {
      const proxy = await deployProxy();
      resolve(proxy);
    }
    else {
      resolve(getContract(contractData.filename, proxyAddress));
    }
  });
}

function getContractArtifacts(filename) {
  console.log(`Getting artifacts for ${filename}.`);
  let artifacts;
  try {
    const path = `../build/contracts/${withoutExtension(filename)}.json`;
    artifacts = require(path);
  }
  catch(error) {
    console.log(colors.red(`No compiled artifacts found for ${filename} - ${error}`));
  }
  return artifacts;
}

function getTruffleContract(filename) {
  console.log(`Getting TruffleContract for ${filename}.`);
  const artifacts = getContractArtifacts(filename);
  const truffleContract = TruffleContract(artifacts);
  truffleContract.defaults({
    from: web3.eth.accounts[0]
  });
  truffleContract.setProvider(web3.currentProvider);
  return truffleContract;
}

function str(object) {
  return JSON.stringify(object, null, 2);
}

function deployNewContract(filename, args, props) {
  args = args || [];
  props = props || {
    gasPrice: 100000000000,
    gas: 6000000
  }
  console.log(`Deploying new contract: ${filename}, args: [${args}], props: ${str(props)}`)
  return new Promise(async (resolve, reject) => {
    const truffleContract = getTruffleContract(filename);
    const contract = await truffleContract.new(...args, props);
    console.log(colors.green(`New contract deployed: ${filename}, at: ${contract.address}`));
    resolve(contract);
  });
}

function getContractAt(filename, address) {
  return new Promise((resolve, reject) => {
    const contract = getTruffleContract(filename).at(address);
    resolve(contract);
  });
}

async function deployContract(contractData) {
  console.log(colors.cyan(contractData.filename));

  // Deploy registry.
  // TODO: reuse if existing
  const registry = await deployNewContract("Registry.sol");

  // Deploy factory.
  // TODO: reuse if existing.
  const factory = await deployNewContract("Factory.sol", [registry.address]);
  console.log(`Factory's registry: ${await factory.registry()}`);
  factory.contract.allEvents().watch((error, event) => {
    console.log('FACTORY EVENT');
    console.log(event, error);
  });

  // Deploy implementation and upload it to the registry.
  // TODO: reuse if existing.
  const implementation = await deployNewContract(contractData.filename);
  await registry.addVersion('0', implementation.address);
  console.log(`Added version '0' to the registry: ${await registry.getVersion('0')}`);

  // Deploy proxy.
  // TODO: reuse if existing.
  console.log(colors.gray(`Deploying proxy...`));
  // const initData = implementation.contract.initialize.getData(web3.eth.accounts[0]);
    // const methodId = abi.methodID('initialize', ['address']).toString('hex');
    // const params = abi.rawEncode(['address'], [web3.eth.accounts[0]]).toString('hex');
    // const initData = '0x' + methodId + params;
  // console.log(`initData: ${initData}`);
  const proxyData = await factory.createProxy('0', {from: web3.eth.accounts[0]});
  // const proxyData = await factory.createProxyAndCall('0', initData, {from: web3.eth.accounts[1]});
  console.log(proxyData)
  const proxyAddress = proxyData.logs[0].args.proxy;
  console.log(colors.green(`Proxy deployed at: ${proxyAddress}`));
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
    deployContract(contractData);
  }
}
execute();
