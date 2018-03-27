
const prompt = require('prompt');
const colors = require('colors');
const Web3 = require("web3");
const figlet = require('figlet');

const deploy_data = require("./deploy_data.json");

let network;

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

async function execute() {

  welcomeMsg();

  // TODO: validate schema
  // Verify that networks exist, contracts exist, etc and notify user if 
  // problems exist, then exit.

  // Select a network.
  network = await selectNetwork();
  console.log(colors.cyan('Selected network:', network.name));

  // Connect to network.
  await connectNetwork();

  // Iterate contract entries.
  const contracts = deploy_data.contracts;
  for(let i = 0; i < contracts.length; i++) {
    const aContract = contracts[i];
    console.log(colors.red(aContract.name));
  }
}
execute();
