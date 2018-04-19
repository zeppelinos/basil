'use strict';

import './app.scss';
import 'materialize-css/dist/js/materialize.js';
import 'materialize-css/dist/css/materialize.css';

import React from 'react';
import ReactDOM from 'react-dom';
import Root from './js/components/Root.react';
import Store from './js/store';

require('babel-register');
require('babel-polyfill');
require('materialize-loader');

ReactDOM.render(<Root store={Store} />, document.getElementById('app'));
