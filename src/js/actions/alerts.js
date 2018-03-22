import * as ActionTypes from '../actiontypes';

const AlertActions = {
  showError (error, message = null) {
    console.error(error);
    return dispatch => {
      dispatch({ type: ActionTypes.SHOW_ERROR, message: (message || error.message) });
    };
  },

  reset () {
    return dispatch => dispatch({ type: ActionTypes.RESET_ERROR });
  },
};

export default AlertActions;
