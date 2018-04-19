import Network from '../network';

export default function fromWei (amount) {
  return Network.web3().fromWei(amount, 'ether');
}
