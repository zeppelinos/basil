// Deploy registry with sample kernel instance to target network
// Run as: `npx truffle exec scripts/deploy.js --network NETWORK`

global.artifacts = artifacts;
global.web3 = web3;
global.network = process.argv[5];
global.log = true;

module.exports = require('../deploy/deploy.js');
