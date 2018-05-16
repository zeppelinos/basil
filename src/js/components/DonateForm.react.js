import React from 'react';
import Store from '../store'
import { connect } from 'react-redux'
import { HuePicker } from 'react-color'
import AccountActions from '../actions/accounts'
import DonationsActions from '../actions/donations'

class DonateForm extends React.Component {
  constructor(props){
    super(props)
    this.state = { value: 0, color: { rgb: { r: 255, g: 0, b: 0 } } }
    this._updateValue = this._updateValue.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  componentWillMount() {
    Store.dispatch(AccountActions.findAccount());
  }

  render() {
    const rgb = this.state.color.rgb;
    const { address, balance } = this.props.account;
    return (
      <div className="col">
        <form className="basil card" onSubmit={this._handleSubmit}>
          <div className="card-content">
            <div className="row no-margin">
              <div className="donate-form col s6">

                <h3 className="title">Customize the Zeppelin LED</h3>

                <HuePicker className="color-picker" style={{width: 100}} onChangeComplete={this._updateColor} color={rgb}/>

                <input value={address} type="text" id="owner" disabled required/>

                <div className="row no-margin">
                  <div className="input-field col s6">
                    <label htmlFor="value">Value (ETH)</label>
                    <input onChange={this._updateValue} type="number" step="any" id="value" required/>
                  </div>
                  <div className="input-field submit col s6">
                    <button className="btn donate">Donate</button>
                  </div>
                </div>
              </div>

              <div className="basil-icon col s6" style={{backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}}>
                <img width="150" src={require('../../images/basil.svg')}></img>
                <span className="notch"></span>
              </div>

            </div>
          </div>
        </form>
      </div>
    )
  }

  _handleSubmit(e) {
    e.preventDefault()
    const { value, color } = this.state
    Store.dispatch(DonationsActions.donate(this.props.account.address, value, color.rgb.r, color.rgb.g, color.rgb.b))
  }

  _updateValue(e) {
    e.preventDefault()
    this.setState({ value: e.target.value })
  }

  _updateColor = color => {
    this.setState({ color: color })
  }
}

function mapStateToProps({ account, donations }) {
  return { account, donations }
}

export default connect(mapStateToProps)(DonateForm)
