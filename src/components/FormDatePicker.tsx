import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Controller, useFormContext } from 'react-hook-form';

type FormDatePickerProps = {
    name: string;
};
export function FormDatePicker({ name }: FormDatePickerProps) {
    const {
        control,
        formState: { errors },
    } = useFormContext();
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => {
                return (
                    <DatePicker
                        className="!mt-2"
                        value={dayjs(field.value)}
                        inputRef={field.ref}
                        label="Frist"
                        slotProps={{
                            textField: { size: 'medium', helperText: errors[name]?.message },
                        }}
                        onChange={(date) => {
                            field.onChange(date);
                        }}
                    />
                );
            }}
        />
    );
}
