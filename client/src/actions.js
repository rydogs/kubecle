const CHANGE_NS = 'CHANGE_NS';

function changeNs(namespace) {
    return dispatch => dispatch({
        type: CHANGE_NS,
        namespace
    });
}

module.exports = {
    changeNs,
    CHANGE_NS
};
