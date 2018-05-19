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

  componentWillReceiveProps(nextProps) {

    // Init value set
    let highestDonation = parseFloat(nextProps.basil.highestDonation, 10);
    if(highestDonation != 0) {
      this.setState({
        value: (highestDonation + 0.001).toFixed(3)
      });
    }

    // Init color set
    const r = parseInt(nextProps.basil.r, 10);
    const g = parseInt(nextProps.basil.g, 10);
    const b = parseInt(nextProps.basil.b, 10);
    const currentRgbIsRed = this.state.color.rgb.r == 255 && this.state.color.rgb.g == 0 && this.state.color.rgb.b == 0;
    const incomingRgbIsZero = r == 0 && g == 0 && b == 0;
    if(currentRgbIsRed && !incomingRgbIsZero) {
      this.setState({
        color: {
          rgb: {r, g, b} 
        }
      });
    }
  }

  render() {
    const rgb = this.state.color.rgb;
    const { address, balance } = this.props.account;
    let { highestDonation } = this.props.basil;
    highestDonation = parseFloat(highestDonation, 10);
    const newHighestDonation = highestDonation + 0.01
    return (
      <form className="basil card" onSubmit={this._handleSubmit}>
        <div className="card-content">
          <div className="row no-margin">
            <div className="col s6">
              <div className="donate-form">
                <h3 className="title">Donate more than {highestDonation} ETH to change the color of the Hue lamp in Zeppelin's Office!</h3>

                <HuePicker className="color-picker" style={{width: 100}} onChangeComplete={this._updateColor} color={rgb}/>

                <input value={address} type="text" id="owner" disabled required/>

                <div className="row no-margin">
                  <div className="input-field col s6">
                    <input onChange={this._updateValue} type="number" step="any" id="value"  value={this.state.value} required/>
                  </div>
                  <div className="input-field submit col s6">
                    <button className="btn donate">Donate</button>
                  </div>
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
    )
  }

  _handleSubmit(e) {
    e.preventDefault()
    const { value, color } = this.state
    Store.dispatch(DonationsActions.donate(this.props.account.address, value, color.rgb.r, color.rgb.g, color.rgb.b))
  }

  _updateValue(e) {
    console.log('UPDATE')
    e.preventDefault()
    this.setState({ value: e.target.value })
  }

  _updateColor = color => {
    this.setState({ color: color })
  }
}

function mapStateToProps({ account, donations, basil }) {
  return { account, donations, basil }
}

export default connect(mapStateToProps)(DonateForm)
