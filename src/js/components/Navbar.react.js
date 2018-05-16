import React from 'react'
import Store from '../store'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import BasilActions from "../actions/basil";

class Navbar extends React.Component {

  componentWillMount() {
    Store.dispatch(BasilActions.find())
  }

  render() {
    const basil = this.props.basil
    return (
      <nav className="container main-nav">
        <div className="row nav-wrapper">
          <div className="col m12 l6">
            <Link to="/" className="brand-logo">
              <img width="150" src={require('../../images/zeppelin-logo.png')}/>
            </Link>
          </div>
          <div className="col m12 l6">
            {basil &&
              <ul className="right grey-text">
                <li>Last donation: <strong>{basil.highestDonation} ETH</strong></li>
                &nbsp;
                <li>RGB: <strong>{basil.r} - {basil.g} - {basil.b}</strong></li>
              </ul>
            }
          </div>
        </div>
      </nav>
    )
  }
}

function mapStateToProps({ basil }) {
  return { basil }
}

export default connect(mapStateToProps)(Navbar)
