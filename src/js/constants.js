import * as config from '../../truffle.js';

// export const ACTIVE_NETWORK = config.networks.development;
export const ACTIVE_NETWORK = config.networks.ropsten;

const deployData = require(`../../migrations/deploy_data.${ACTIVE_NETWORK.name}.json`);
export const BASIL_ADDRESS = deployData.proxyAddress;
