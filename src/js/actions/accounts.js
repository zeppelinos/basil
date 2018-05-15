import Network from '../network'
import { Token } from '../contracts'
import AlertActions from './alerts'
import * as ActionTypes from '../actiontypes'
import { TOKEN_ADDRESS } from '../constants'

const AccountActions = {
  findAccount() {
    return async function(dispatch) {
      try {
        const addresses = await Network.getAccounts()
        const mainAddress = addresses[0]
        dispatch(AccountActions.receiveAccount(mainAddress))
        dispatch(AccountActions.getEtherBalance(mainAddress))
        dispatch(AccountActions.getTokenBalance(mainAddress))
      } catch(error) {
        dispatch(AlertActions.showError(error))
      }
    }
  },

  getTokenBalance(address) {
    return async function(dispatch) {
      try {
        const token = Token.at(TOKEN_ADDRESS)
        const balance = await token.balanceOf(address);
        dispatch(AccountActions.receiveTokenBalance(balance))
      } catch(error) {
        dispatch(AlertActions.showError(error))
     }
    }
  },

  getEtherBalance(address) {
    return async function(dispatch) {
      try {
        const balance = await Network.getBalance(address);
        dispatch(AccountActions.receiveEtherBalance(balance))
      } catch(error) {
        dispatch(AlertActions.showError(error))
     }
    }
  },

  receiveAccount(address) {
    return { type: ActionTypes.RECEIVE_ACCOUNT, address }
  },

  receiveEtherBalance(balance) {
    return { type: ActionTypes.RECEIVE_ETHER_BALANCE, balance }
  },

  receiveTokenBalance(balance) {
    return { type: ActionTypes.RECEIVE_TOKEN_BALANCE, balance }
  }
}

export default AccountActions
