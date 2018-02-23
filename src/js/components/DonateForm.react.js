import React from 'react';
import Store from '../store'
import { connect } from 'react-redux'
import AccountActions from '../actions/accounts'
import DonationsActions from '../actions/donations'

class DonateForm extends React.Component {
  constructor(props){
    super(props)
    this.state = { value: 0, r: 0, g: 0, b: 0 }
    this._updateR = this._updateR.bind(this)
    this._updateG = this._updateG.bind(this)
    this._updateB = this._updateB.bind(this)
    this._updateValue = this._updateValue.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  componentWillMount() {
    Store.dispatch(AccountActions.findAccount());
  }

  render() {
    const { address, balance } = this.props.account;
    return (
      <div className={"col " + this.props.col}>
        <form className="card" onSubmit={this._handleSubmit}>
          <div className="card-content">
            <h3 className="title">Donate to our basil!</h3>
            <div className="row">
              <div className="input-field col s7">
                <label htmlFor="owner" className='active'>You (address)</label>
                <input value={address} type="text" id="owner" disabled required/>
              </div>
              <div className="input-field col s2">
                <label htmlFor="value">Value (eth)</label>
                <input onChange={this._updateValue} type="number" step="any" id="value" required/>
              </div>
              <div className="input-field col s1">
                <label htmlFor="color_r">R</label>
                <input onChange={this._updateR} type="number" id="color_r" required/>
              </div>
              <div className="input-field col s1">
                <label htmlFor="color_g">G</label>
                <input onChange={this._updateG} type="number" id="color_g" required/>
              </div>
              <div className="input-field col s1">
                <label htmlFor="color_b">B</label>
                <input onChange={this._updateB} type="number" id="color_b" required/>
              </div>
            </div>
          </div>
          <div className="card-action">
            <div className="row no-margin">
              <button className="btn btn-primary">Donate</button>
            </div>
          </div>
        </form>
      </div>
    )
  }

  _handleSubmit(e) {
    e.preventDefault()
    const { value, r, g, b } = this.state
    Store.dispatch(DonationsActions.donate(this.props.account.address, value, r, g, b))
  }

  _updateValue(e) {
    e.preventDefault()
    this.setState({ value: e.target.value })
  }

  _updateR(e) {
    e.preventDefault()
    this.setState({ r: e.target.value })
  }

  _updateG(e) {
    e.preventDefault()
    this.setState({ g: e.target.value })
  }

  _updateB(e) {
    e.preventDefault()
    this.setState({ b: e.target.value })
  }
}

function mapStateToProps({ account, donations }) {
  return { account, donations }
}

export default connect(mapStateToProps)(DonateForm)
