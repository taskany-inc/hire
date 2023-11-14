import { Autocomplete, AutocompleteProps } from './Autocomplete/Autocomplete';
import { Container, FormHelperText, Label } from './StyledComponents';

type FormAutocompleteProps = {
    label: string;
    helperText?: string;
} & AutocompleteProps<any>;

export const FormAutoComplete = ({ label, helperText, ...restProps }: FormAutocompleteProps) => {
    return (
        <Container>
            <Label>{label}</Label>
            <Autocomplete {...restProps} />
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </Container>
    );
};
