export const CHANGE_CONTEXT = 'CHANGE_CONTEXT';

export function changeContext(namespace, context) {
    return dispatch => dispatch({
        type: CHANGE_CONTEXT,
        namespace,
        context
    });
}
