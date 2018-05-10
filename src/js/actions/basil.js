import { Basil } from '../contracts'
import AlertActions from './alerts'
import * as ActionTypes from '../actiontypes'
import { BASIL_ADDRESS } from '../constants'
import fromWei from "../helpers/fromWei";

const BasilActions = {

  find() {
    return async function(dispatch) {
      try {
        const basil = Basil.at(BASIL_ADDRESS)
        dispatch(BasilActions.receive(basil))
      } catch(error) {
        dispatch(AlertActions.showError(error))
      }
    }
  },

  receive(basil) {
    return async function(dispatch) {
      const r = (await basil.r()).toString()
      const g = (await basil.g()).toString()
      const b = (await basil.b()).toString()
      const highestDonation = fromWei(await basil.highestDonation()).toString()
      dispatch({
        type: ActionTypes.RECEIVE_BASIL,
        basil: { r, g, b, highestDonation }
      })
    }
  },
}

export default BasilActions
