import React from 'react';
import * as ActionTypes from '../actiontypes'

const initialState = { connected: null, couldAccessAccount: null }

const NetworkReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.CONNECTION_FAILED:
      return Object.assign({}, state, { connected: false })
    case ActionTypes.CONNECTION_SUCCEEDED:
      return Object.assign({}, state, { connected: true })
    case ActionTypes.COULD_ACCESS_ACCOUNT:
      return Object.assign({}, state, { couldAccessAccount: true })
    case ActionTypes.COULD_NOT_ACCESS_ACCOUNT:
      return Object.assign({}, state, { couldAccessAccount: false })
    default:
      return state
  }
}

export default NetworkReducer
