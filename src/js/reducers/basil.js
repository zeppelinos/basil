import React from 'react';
import * as ActionTypes from '../actiontypes'

const BasilReducer = (state = { highestDonation: 0, r: 0, g: 0, b: 0}, action) => {
  switch (action.type) {
    case ActionTypes.RECEIVE_BASIL:
      return action.basil;
    default:
      return state
  }
};

export default BasilReducer;
