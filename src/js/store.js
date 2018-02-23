import React from 'react'
import thunkMiddleware from 'redux-thunk'
import basil from './reducers/basil'
import alert from './reducers/alerts'
import network from './reducers/network'
import account from './reducers/accounts'
import fetching from './reducers/fetching'
import donations from './reducers/donations'
import { createStore, combineReducers, applyMiddleware } from 'redux'

const mainReducer = combineReducers({
  alert,
  basil,
  donations,
  network,
  account,
  fetching,
});

const Store = createStore(
  mainReducer,
  applyMiddleware(thunkMiddleware)
);

export default Store;
