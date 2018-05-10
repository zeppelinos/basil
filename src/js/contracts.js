import Network from './network'
import contract from 'truffle-contract'

const provider = Network.provider();

// const Basil = contract(require('../../build/contracts/Basil.json'));
const Basil = contract(require('../../build/contracts/BasilERC721.json'));
Basil.setProvider(provider);

export {
  Basil,
}
