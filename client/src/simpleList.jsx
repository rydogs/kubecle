import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const SimpleList = (props) => {
    const {data} = props;
    return (
        <List dense>
            { Array.isArray(data) ? 
                data.map((v, i) => {
                    return (
                        <ListItem key={i} disableGutters>
                            <ListItemText primary={v} />
                        </ListItem>
                    )
                }):
                data && Object.keys(data).map((k, i) => {
                    return (
                        <ListItem key={i} disableGutters>
                            <ListItemText primary={`${k}: ${data[k]}`} />
                        </ListItem>
                    )
                })
            }
        </List>
    );
};

export default SimpleList;