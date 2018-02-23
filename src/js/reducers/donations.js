import React from 'react';
import * as ActionTypes from '../actiontypes'

const initialState = { list: [], donation: null }

const DonationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.ADD_DONATION:
      let donations = state.list;
      return Object.assign({}, state, { list: [action.donation].concat(donations) })
    case ActionTypes.RESET_DONATION:
      return Object.assign({}, state, { donation: null })
    case ActionTypes.RECEIVE_DONATION:
      return Object.assign({}, state, { donation: action.donation })
    default:
      return state
  }
};

export default DonationsReducer;
