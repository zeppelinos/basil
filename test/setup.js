import { Logger } from 'zos-lib'

const DEFAULT_TX_PARAMS = {
  gas: 6721975,
  gasPrice: 100000000000,
  from: web3.eth.accounts[0]
}

function muteLogging() {
  Logger.prototype.info = msg => {}
  Logger.prototype.error = msg => {}
}

muteLogging()
