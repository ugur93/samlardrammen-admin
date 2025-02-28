import { ListItem } from '@mui/material';
import ListItemText, { ListItemTextProps } from '@mui/material/ListItemText';
import React from 'react';

const CustomListItemText: React.FC<ListItemTextProps & { secondaryBelow?: boolean }> = (props) => {
    return (
        <ListItem dense disableGutters disablePadding>
            <ListItemText
                {...props}
                className={`flex ${props.secondaryBelow ? 'flex-col' : 'flex-row'} gap-2 text-black [&_span]:after:content-[':']`}
            />
        </ListItem>
    );
};

export default CustomListItemText;
