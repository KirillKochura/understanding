import * as actionTypes from './actionTypes';
import axios from 'axios';
import {apiUrl} from '../../Root/settings';


export const loadMoreTests = (skip=0) => async (dispatch) => {
  dispatch(loadMoreTestsStarted());
  try {
    const response = await axios.get(`${apiUrl}/api/tests?skip=${skip}`);
    dispatch(loadMoreTestsSuccess(response.data));
  } catch (er) {
    dispatch(loadMoreTestsError(er));
  }
}

const loadMoreTestsStarted = () => ({
  type: actionTypes.LOAD_MORE_TESTS_STARTED,
});

const loadMoreTestsSuccess = resp => ({
  type: actionTypes.LOAD_MORE_TESTS_SUCCESS,
  data: resp.data,
  count: resp.count,
});

const loadMoreTestsError = error => ({
  type: actionTypes.LOAD_MORE_TESTS_ERROR,
  message: error.message,
});

export const testStart = id => async (dispatch) => {
  dispatch(testStartStarted(id));
  try {
    const response = await axios.get(`${apiUrl}/api/test/${id}`);
    if (response.status > 399) throw new Error(`cannot get test with id ${id}`);
    dispatch(testStartSuccess(response.data));
  } catch(er) {
    dispatch(testStartError(er));
  }
}

const testStartStarted = id => ({
  type: actionTypes.TEST_START_STARTED,
  id: id,
})

const testStartSuccess = resp => ({
  type: actionTypes.TEST_START_SUCCESS,
  data: resp.data,
});

const testStartError = er => ({
  type: actionTypes.TEST_START_ERROR,
  message: er.message,
});

const sendNewTestStart = () => ({type: actionTypes.SEND_NEW_TEST_START});
const sendNewTestSuccess = () => ({type: actionTypes.SEND_NEW_TEST_SUCCESS});
const sendNewTestError = (e) => ({type: actionTypes.SEND_NEW_TEST_ERROR, error: e.message});

export const sendNewTest = data => async (dispatch) => {
  dispatch(sendNewTestStart());
  try {
    const resp = await axios.post(`${apiUrl}/api/tests`, data);
    if (resp.error) throw new Error(resp.error);
  dispatch(sendNewTestSuccess());
  } catch (error) {
    dispatch(sendNewTestError(error));
  }
}
