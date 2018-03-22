import Network from './network';
import contract from 'truffle-contract';

const provider = Network.provider();

const Basil = contract(require('../../build/contracts/Basil.json'));
Basil.setProvider(provider);

export {
  Basil,
};
