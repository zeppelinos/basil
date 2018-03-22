import React from 'react';
import Store from '../store';
import { connect } from 'react-redux';
import { HuePicker } from 'react-color';
import AccountActions from '../actions/accounts';
import DonationsActions from '../actions/donations';

class DonateForm extends React.Component {
  constructor(props){
    super(props);
    this.state = { value: 0, color: { rgb: { r: 0, g: 0, b: 0 } } };
    this._updateValue = this._updateValue.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  componentWillMount() {
    Store.dispatch(AccountActions.findAccount());
  }

  render() {
    const rgb = this.state.color.rgb;
    const { address, balance } = this.props.account;
    return (
      <div className={"col " + this.props.col}>
        <form className="card" onSubmit={this._handleSubmit}>
          <div className="card-content">
            <h3 className="title">Donate to our basil!</h3>
            <div className="row no-margin">
              <div className="input-field col s9">
                <label htmlFor="owner" className='active'>You (address)</label>
                <input value={address} type="text" id="owner" disabled required/>
              </div>
              <div className="input-field col s3">
                <label htmlFor="value">Value (eth)</label>
                <input onChange={this._updateValue} type="number" step="any" id="value" required/>
              </div>
            </div>
            <div className="row no-margin">
              <div className="col s4">
                <p>Pick a color for a photo!</p>
              </div>
              <div className="col s5">
                <HuePicker style={{width: 100}} onChangeComplete={this._updateColor} color={rgb}/>
              </div>
              <div className="col s3">
                <label disabled>RGB({rgb.r}, {rgb.g}, {rgb.g})</label>
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
