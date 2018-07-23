import { CHANGE_CONTEXT } from './actions';
import history from './history';

const searchParams = new URLSearchParams(window.location.search);
const initialState = {
    currentNs: searchParams.get('namesapce') || 'default',
    currentContext: searchParams.get('context') || '',
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
      case CHANGE_CONTEXT: {
        history.push({'search': `?context=${action.context}&namesapce=${action.namespace}`});
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