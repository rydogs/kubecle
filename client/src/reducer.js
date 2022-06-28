import history from './history';

const searchParams = new URLSearchParams(window.location.search);
const initialState = {
    currentNs: searchParams.get('namespace') || 'default',
    currentContext: searchParams.get('context') || ''
};

const CHANGE_CONTEXT = 'CHANGE_CONTEXT';

export const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case CHANGE_CONTEXT: {
            const { context, namespace } = action;

            console.log("CHANGE_CONTEXT", context, namespace)
            history.push({ search: `?context=${context}&namespace=${namespace}` });
            return {
                currentNs: namespace,
                currentContext: context
            };
        }
        default:
            return state;
    }
};