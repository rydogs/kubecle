import { CHANGE_CONTEXT } from './actions';

const initialState = {
    currentNs: "default",
    currentContext: "",
};

const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has('context') && searchParams.has('namespace')) {
  Object.assign(initialState, {
    currentContext: searchParams.get('context'),
    currentNs: searchParams.get('namespace'),
  });
}

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