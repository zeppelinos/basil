import Network from "../network";

export default function toWei(amount) {
  return Network.web3().toWei(amount, 'ether')
}
