import React from 'react';
import Store from '../store';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import BasilActions from '../actions/basil';

class Navbar extends React.Component {
  componentWillMount () {
    Store.dispatch(BasilActions.find());
  }

  render () {
    const basil = this.props.basil;
    return (
      <nav>
        <div className="nav-wrapper">
          <Link to="/" className="brand-logo">
            <img width="150" src={require('../../images/zeppelin-logo.png')}/>
            pi
          </Link>
          {basil &&
            <ul className="right grey-text">
              <li>Donation {basil.highestDonation} | </li>
              <li>RGB {basil.r}, {basil.g}, {basil.b}</li>
            </ul>
          }
        </div>
      </nav>
    );
  }
}

function mapStateToProps ({ basil }) {
  return { basil };
}

export default connect(mapStateToProps)(Navbar);
