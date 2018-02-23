import React from 'react'
import Store from '../store'
import { connect } from 'react-redux'
import DonationsActions from '../actions/donations'

class DonationsList extends React.Component {

  componentWillMount() {
    Store.dispatch(DonationsActions.findAll())
  }

  render() {
    const donations = this.props.donations.list
    return (
      <div className={"col " + this.props.col}>
        <div className="card donations-list">
          <div className="card-content">
            <h3 className="title">Basil donations</h3>
            { donations.length === 0 ? <em>Loading...</em> : <ul className="collection">{this._buildDonationsList(donations)}</ul>}
          </div>
        </div>
      </div>
    )
  }

  _buildDonationsList(donations) {
    return donations.map(donation => {
      return (
        <li className="collection-item" key={donation.donor}>
          <div>
            <b>{donation.donor}</b>
            <span className='secondary-content'>ETH {donation.value}</span>
          </div>
        </li>
      )
    })
  }
}

function mapStateToProps({ donations }) {
  return { donations }
}

export default connect(mapStateToProps)(DonationsList)
