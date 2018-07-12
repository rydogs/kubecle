import { CHANGE_CONTEXT } from './actions';

const initialState = {
    currentNs: "default",
    currentContext: "",
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
      case CHANGE_CONTEXT: {
        return {
            currentNs: action.namespace,
            currentContext: action.context
        }
      }
      default:
        return state;
    }
};

module.exports = {
    rootReducer,
    initialState
};