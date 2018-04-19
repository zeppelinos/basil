import * as ActionTypes from '../actiontypes';

const FetchingReducer = (state = null, action) => {
  switch (action.type) {
  case ActionTypes.START_FETCHING:
    return action.message;
  case ActionTypes.STOP_FETCHING:
    return null;
  default:
    return state;
  }
};

export default FetchingReducer;
