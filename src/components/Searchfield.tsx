import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import React, { ChangeEvent, useState } from 'react';

interface SearchfieldProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    fullWidth?: boolean;
    variant?: 'outlined' | 'standard' | 'filled';
    size?: 'small' | 'medium';
}

const Searchfield: React.FC<SearchfieldProps> = ({
    placeholder = 'Søk...',
    value: externalValue,
    onChange,
    onSearch,
    fullWidth = false,
    variant = 'outlined',
    size = 'medium',
}) => {
    const [internalValue, setInternalValue] = useState('');

    // Determine if we're using controlled or uncontrolled input
    const value = externalValue !== undefined ? externalValue : internalValue;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (externalValue === undefined) {
            setInternalValue(newValue);
        }
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleSearch = () => {
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClear = () => {
        if (externalValue === undefined) {
            setInternalValue('');
        }
        if (onChange) {
            onChange('');
        }
        if (onSearch) {
            onSearch('');
        }
    };

    return (
        <TextField
            value={value}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            fullWidth={fullWidth}
            variant={variant}
            size={size}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon color="action" />
                    </InputAdornment>
                ),
                endAdornment: value ? (
                    <InputAdornment position="end">
                        <IconButton aria-label="clear search" onClick={handleClear} edge="end" size="small">
                            <ClearIcon />
                        </IconButton>
                    </InputAdornment>
                ) : null,
            }}
        />
    );
};

export default Searchfield;
