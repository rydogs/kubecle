import { CHANGE_CONTEXT } from './actions';
import history from './history';

const searchParams = new URLSearchParams(window.location.search);
const initialState = {
    currentNs: searchParams.get('namesapce') || 'default',
    currentContext: searchParams.get('context') || ''
};

export const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case CHANGE_CONTEXT: {
            const { context, namespace } = action;

            history.push({ search: `?context=${context}&namesapce=${namespace}` });

            return {
                currentNs: namespace,
                currentContext: context
            };
        }
        default:
            return state;
    }
};
