const CHANGE_NS = 'CHANGE_NS';

function changeNs(namespace, context) {
    return dispatch => dispatch({
        type: CHANGE_NS,
        namespace,
        context
    });
}

module.exports = {
    changeNs,
    CHANGE_NS
};
