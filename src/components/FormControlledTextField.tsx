import { TextField, Typography } from '@mui/material';
import { useController, useFormContext } from 'react-hook-form';

export const FormControlledTextField = ({
    name,
    label,
    type,
    disabled,
    editable = true,
    inputMode,
    prefix,
    width,
}: {
    name: string;
    label?: string;
    type?: 'number' | 'email' | 'password' | 'tel' | 'text' | 'url' | 'date';
    disabled?: boolean;
    editable?: boolean;
    prefix?: string;
    inputMode?: 'email' | 'tel' | 'text' | 'url' | 'search' | 'none' | 'numeric' | 'decimal';
    width?: string;
}) => {
    const { control } = useFormContext();
    const { field, fieldState } = useController({ name, control });

    if (!editable) {
        const value = prefix ? `${prefix}${field.value ? `, ${field.value}` : ''}` : field.value;
        return (
            <Typography margin="dense" variant="body1" sx={{ input: { size: 'small' } }}>
                {value}
            </Typography>
        );
    }

    return (
        <TextField
            type={type}
            label={label}
            margin="dense"
            size="small"
            slotProps={{ input: { size: 'small' } }}
            value={field?.value?.toString() ?? ''}
            onChange={field.onChange}
            disabled={disabled}
            error={!!fieldState?.error}
            helperText={fieldState?.error?.message}
            style={width ? { width: width } : undefined}
            inputMode={inputMode}
            onKeyDown={(e) => {
                if (inputMode === 'numeric' && [',', '.'].includes(e.key)) {
                    e.preventDefault();
                }
            }}
        />
    );
};
