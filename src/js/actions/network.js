import Network from '../network';
import AlertActions from './alerts';
import * as ActionTypes from '../actiontypes';

const NetworkActions = {
  checkConnection () {
    return dispatch => {
      Network.web3().isConnected()
        ? dispatch(NetworkActions.connectionSucceeded())
        : dispatch(NetworkActions.connectionFailed());
    };
  },

  checkAccountAccess () {
    return async function (dispatch) {
      try {
        const addresses = await Network.getAccounts();
        addresses[0] // TODO: should I use coinbase?
          ? dispatch(NetworkActions.couldAccessAccount())
          : dispatch(NetworkActions.couldNotAccessAccount());
      } catch (error) {
        dispatch(AlertActions.showError(error));
      }
    };
  },

  connectionSucceeded () {
    return { type: ActionTypes.CONNECTION_SUCCEEDED };
  },

  connectionFailed () {
    return { type: ActionTypes.CONNECTION_FAILED };
  },

  couldAccessAccount () {
    return { type: ActionTypes.COULD_ACCESS_ACCOUNT };
  },

  couldNotAccessAccount () {
    return { type: ActionTypes.COULD_NOT_ACCESS_ACCOUNT };
  },
};

export default NetworkActions;
