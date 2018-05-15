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
        const basil = Basil.at(BASIL_ADDRESS)
        const events = basil.NewDonation({}, { fromBlock: 0, toBlock: 'latest' });
        events.watch(function(error, result) {
          if(error) AlertActions.showError(error)
          else dispatch(DonationsActions.add({
            ...result.args, 
            tx: result.transactionHash
          }))
        })
      } catch(error) {
        dispatch(AlertActions.showError(error))
      }
    }
  },

  donate(donor, value, r, g, b) {
    return async function(dispatch) {
      const message = `Donating ETH ${value} to Zeppelin's Basil! RGB(${r}, ${g}, ${b}) from ${donor}`
      console.log(message)
      dispatch(FetchingActions.start(message))
      try {
        const basil = Basil.at(BASIL_ADDRESS)
        await basil.donate(r, g, b, { 
          from: donor, 
          value: toWei(value),
          gas: 400000,
          gasPrice: 20000000000
        })
        alert("Thank you for your donation! The basil thanks you with this ERC721 token of appreciation ^^")
        dispatch(FetchingActions.stop())
      } catch(error) {
        dispatch(AlertActions.showError(error))
      }
    }
  },

  add(donation) {
    return async function(dispatch) {
      donation.value = fromWei(donation.value).toString()
      dispatch({ type: ActionTypes.ADD_DONATION, donation })
    }
  },
}

export default DonationsActions
