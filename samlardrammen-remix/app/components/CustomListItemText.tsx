import { ListItem } from '@mui/material';
import ListItemText, { type ListItemTextProps } from '@mui/material/ListItemText';
import React from 'react';

const CustomListItemText: React.FC<ListItemTextProps & { secondaryBelow?: boolean }> = ({
    secondaryBelow,
    ...props
}) => {
    return (
        <ListItem dense disableGutters disablePadding>
            <ListItemText
                {...props}
                className={`flex ${secondaryBelow ? 'flex-col' : 'flex-row'} gap-2 text-black [&_span]:after:content-[':']`}
            />
        </ListItem>
    );
};

export default CustomListItemText;
