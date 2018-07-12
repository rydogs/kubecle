const CHANGE_CONTEXT = 'CHANGE_CONTEXT';

function changeContext(namespace, context) {
    return dispatch => dispatch({
        type: CHANGE_CONTEXT,
        namespace,
        context
    });
}

module.exports = {
    changeContext,
    CHANGE_CONTEXT
};
