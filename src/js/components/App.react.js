import React from 'react';
import Store from '../store';
import Alert from './Alert.react';
import Modal from './Modal.react';
import Navbar from './Navbar.react';
import { connect } from 'react-redux';
import DonateForm from './DonateForm.react';
import NetworkActions from '../actions/network';
import DonationsList from './DonationsList.react';
import { withRouter } from 'react-router-dom';

class App extends React.Component {
  componentWillMount () {
    Store.dispatch(NetworkActions.checkConnection());
    Store.dispatch(NetworkActions.checkAccountAccess());
  }

  render () {
    const network = this.props.network;
    const fetching = this.props.fetching;
    return (network.connected && network.couldAccessAccount)
      ? (fetching
        ? <Modal open={fetching} progressBar message={fetching}/>
        : <div>
            <Navbar/>
              <div className="container">
                <Alert/>
                <DonateForm/>
                <DonationsList/>
              </div>
            </div>
         )
    : <div>
        <Modal dark open={!network.connected} message={'Please access using MIST or Metamask'}/>
        <Modal dark open={network.connected && !network.couldAccessAccount} message={'Please enable your account'}/>
      </div>
  }
}

function mapStateToProps ({ fetching, network }) {
  return { fetching, network };
}

export default withRouter(connect(mapStateToProps)(App));
