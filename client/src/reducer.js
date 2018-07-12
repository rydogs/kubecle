import { CHANGE_NS } from './actions';

const initialState = {
    currentNs: "default",
    currentContext: "",
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
      case CHANGE_NS: {
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