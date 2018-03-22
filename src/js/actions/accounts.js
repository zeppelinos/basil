import Network from '../network';
import AlertActions from './alerts';
import * as ActionTypes from '../actiontypes';

const AccountActions = {
  findAccount () {
    return async function (dispatch) {
      try {
        const addresses = await Network.getAccounts();
        const mainAddress = addresses[0];
        dispatch(AccountActions.receiveAccount(mainAddress));
        dispatch(AccountActions.getEtherBalance(mainAddress));
      } catch (error) {
        dispatch(AlertActions.showError(error));
      }
    };
  },

  getEtherBalance (address) {
    return async function (dispatch) {
      try {
        const balance = await Network.getBalance(address);
        dispatch(AccountActions.receiveEtherBalance(balance));
      } catch (error) {
        dispatch(AlertActions.showError(error));
      }
    };
  },

  receiveAccount (address) {
    return { type: ActionTypes.RECEIVE_ACCOUNT, address };
  },

  receiveEtherBalance (balance) {
    return { type: ActionTypes.RECEIVE_ETHER_BALANCE, balance };
  },
};

export default AccountActions;
