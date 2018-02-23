import { Basil } from '../contracts'
import AlertActions from './alerts'
import AccountActions from './accounts'
import FetchingActions from './fetching'
import * as ActionTypes from '../actiontypes'
import { BASIL_ADDRESS } from '../constants'
import Network from "../network";
import toWei from "../helpers/toWei";
import fromWei from "../helpers/fromWei";

const DonationsActions = {

  findAll() {
    return async function(dispatch) {
      try {
        const basil = await Basil.at(BASIL_ADDRESS)
        const events = basil.NewDonation({}, { fromBlock: 0, toBlock: 'latest' });
        events.watch(function(error, result) {
          if(error) AlertActions.showError(error)
          else dispatch(DonationsActions.add({ donor: result.args.donor, value: result.args.value }))
        })
      } catch(error) {
        dispatch(AlertActions.showError(error))
      }
    }
  },

  donate(donor, value, r, g, b) {
    return async function(dispatch) {
      const message = `Donating wei ${value} RGB(${r}, ${g}, ${b}) from ${donor} to Zeppelin's basil`
      console.log(message)
      dispatch(FetchingActions.start(message))
      try {
        const basil = await Basil.at(BASIL_ADDRESS)
        const transaction = await basil.donate(r, g, b, { from: donor, value: toWei(value) })
        const donation = transaction.logs[0].args
        dispatch(DonationsActions.add(donation))
        dispatch(FetchingActions.stop())
      } catch(error) {
        dispatch(AlertActions.showError(error))
      }
    }
  },

  add(donation) {
    return async function(dispatch) {
      donation.value = fromWei(donation.value)
      dispatch({ type: ActionTypes.ADD_DONATION, donation })
    }
  },
}

export default DonationsActions
