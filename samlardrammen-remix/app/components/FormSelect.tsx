import {
    Box,
    Checkbox,
    Chip,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface FormSelectProps {
    options: { id: string; name: string }[];
    label: string;
    name: string;
}
export default function FormSelect({ options, label, name }: FormSelectProps) {
    const { control } = useFormContext();
    const selectOptionaValues = options.map((option) => option.id);
    return (
        <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="organizations-label">{label}</InputLabel>
            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <Select
                        {...field}
                        labelId="organizations-label"
                        multiple
                        value={selectOptionaValues}
                        input={<OutlinedInput label={label} />}
                        renderValue={(renderedOptions) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {renderedOptions?.map((value) => {
                                    const org = options.find((option) => option.id === value);
                                    return <Chip key={value} label={org?.name || value} />;
                                })}
                            </Box>
                        )}
                    >
                        {options.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                <Checkbox checked={selectOptionaValues.includes(option.id)} />
                                <ListItemText primary={option.name} />
                            </MenuItem>
                        ))}
                    </Select>
                )}
            />
        </FormControl>
    );
}
