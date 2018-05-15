import Network from './network'
import contract from 'truffle-contract'

const provider = Network.provider();

// const Basil = contract(require('../../build/contracts/Basil.json'));
const Basil = contract(require('../../build/contracts/BasilERC721.json'));
Basil.setProvider(provider);

const Token = contract(require('../../build/contracts/MintableERC721Token.json'));
Token.setProvider(provider);

export {
  Basil,
  Token
}
