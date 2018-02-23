import React from 'react'
import Store from '../store'
import { connect } from 'react-redux'
import AlertActions from '../actions/alerts'

class Alert extends React.Component {
  componentWillReceiveProps(nextProps) {
    if(nextProps.alert !== this.props.alert) setTimeout(() => Store.dispatch(AlertActions.reset()), 5000)
  }
  
  render() {
    const alert = this.props.alert;
    return !alert ? <div/> :
      <div>
        <div className="row">
          <div className="col s12">
            <div className="card red lighten-1">
              <div className="card-content white-text">
                <p className="center">{alert.message} <span className="close-error" onClick={this._cleanAlert}>x</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  }

  _cleanAlert = e => {
    e.preventDefault();
    Store.dispatch(AlertActions.reset())
  }
}

function mapStateToProps({ alert }) {
  return { alert }
}

export default connect(mapStateToProps)(Alert)
