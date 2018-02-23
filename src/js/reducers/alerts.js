import React from 'react';
import * as ActionTypes from '../actiontypes'

const AlertsReducer = (state = null, action) => {
  switch (action.type) {
    case ActionTypes.SHOW_ERROR:
      return { message: action.message };
    case ActionTypes.RESET_ERROR:
      return null;
    default:
      return state
  }
};

export default AlertsReducer;
