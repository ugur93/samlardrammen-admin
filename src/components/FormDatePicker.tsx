import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Controller, useFormContext } from 'react-hook-form';

type FormDatePickerProps = {
    name: string;
    label: string;
    disabled?: boolean;
    editable?: boolean;
};
export function FormDatePicker({ name, label, editable = true }: FormDatePickerProps) {
    const {
        control,
        getValues,
        formState: { errors },
    } = useFormContext();
    if (!editable) {
        const date = getValues(name);
        return <span>{date ? new Date(date).toLocaleDateString() : '-'}</span>;
    }
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => {
                console.log('field', field.value, dayjs(field.value, 'DD/MM/YYYY'));
                return (
                    <DatePicker
                        className="!mt-2"
                        value={dayjs(field.value, 'DD/MM/YYYY')}
                        inputRef={field.ref}
                        label={label}
                        format="DD/MM/YYYY"
                        slotProps={{
                            textField: { size: 'small', helperText: errors[name]?.message },
                        }}
                        onChange={(date) => {
                            console.log('onchange', date, date?.locale('nb')?.format('DD/MM/YYYY'));
                            field.onChange(date?.format('DD/MM/YYYY'));
                        }}
                    />
                );
            }}
        />
    );
}
