import axios from 'axios'
import { assign, concat } from 'lodash'
import {
    FETCH_MESSAGE,
    FETCH_ATTACKERS,

    GENERATE_PINCODE
} from './types'

import { apiError } from './errors'

import { ROOT_URL } from './config'

export const fetchMessage = () => {
  return (dispatch) => {
    let config = {
      headers: {
        'Cache-Control': 'no-cache',
        'X-Authorization': window.localStorage.getItem('token')
      }
    }
    axios.get(`${ROOT_URL}/api/me`, config)
    .then(response => fetchMessageSuccess(dispatch, response))
    .catch(error => authError(error)) // TODO: here may be another error action
  }

  const fetchMessageSuccess = (dispatch, response) => {
    dispatch({
      type: FETCH_MESSAGE,
      payload: response.data.username
    })
  }
}

export const fetchAttackers = () => {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/attacker`, { params: { } })
      .then(response => fetchAttackersSuccess(dispatch, response))
      .catch(error => apiError(dispatch, error))
  }

  const fetchAttackersSuccess = (dispatch, response) => {
    dispatch({
      type: FETCH_ATTACKERS,
      data: response.data._embedded.attackers
    })
  }
}

export const generatePincode = () => {
  return function (dispatch) {
    axios.get(`${ROOT_URL}/genpin`)
      .then(response => generatePincodeSuccess(dispatch, response))
      .catch(error => apiError(dispatch, error))
  }

  const generatePincodeSuccess = (dispatch, response) => {
    dispatch({
      type: GENERATE_PINCODE,
      data: response.data
    })
  }
}
