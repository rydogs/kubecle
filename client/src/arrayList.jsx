import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const ArrayList = function(props) {
    return (
        <List dense>
            {props.data && props.data.map((v, i) => {
                return (
                    <ListItem key={i} disableGutters>
                        <ListItemText primary={v} />
                    </ListItem>
                );
            })}
        </List>        
    );
};

export default ArrayList;