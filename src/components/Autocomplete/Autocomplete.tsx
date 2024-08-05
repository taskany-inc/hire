import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useKeyboard, KeyCode, Badge, Popup, FormInput } from '@taskany/bricks';

import { Option } from '../../utils/types';
import { ColorizedMenuItem } from '../ColorizedMenuItem';

import { tr } from './Autocomplete.i18n';
import s from './Autocomplete.module.css';

export interface AutocompleteProps<T> {
    options: T[];
    value?: T[];
    multiple?: boolean;
    createNewOption?: any;
    text?: string;
    visible?: boolean;
    ref?: React.Ref<HTMLDivElement>;
    onInputChange?: (value: string) => void;
    onChange?: (value: T) => void;
    placeholder?: string;
    label?: string;
}

export function Autocomplete({
    visible = false,
    onChange,
    ref,
    createNewOption,
    multiple,
    options,
    value = [],
    onInputChange,
    label,
}: AutocompleteProps<any>) {
    // TODO gotta figure out the types
    const popupRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [popupVisible, setPopupVisibility] = useState(visible);
    const [inputValue, setInputValue] = useState('');
    const [added, setAdded] = useState<Array<Option>>(value);

    const filteredItems = options
        .filter((item) =>
            typeof item === 'string'
                ? item.toLowerCase().includes(inputValue.toLowerCase())
                : item.text.toLowerCase().includes(inputValue.toLowerCase()),
        )
        .filter((item) => {
            if (multiple) return !added.map(({ value }) => value).includes(item.value);

            return item;
        });

    useEffect(() => {
        setPopupVisibility(visible);
    }, [visible]);

    const onClickOutside = useCallback(() => {
        setPopupVisibility(false);
    }, []);

    const onTriggerClick = useCallback(() => {
        setPopupVisibility(true);
    }, []);

    const onItemClick = useCallback(
        (value: any) => () => {
            if (multiple) {
                setInputValue('');
                const newAdded = [value, ...added];
                setAdded(newAdded);
                inputRef.current && inputRef.current.focus();
                onChange && onChange(newAdded as Option[] | string[]);

                return;
            }
            onChange && onChange(value);
            setInputValue(typeof value === 'string' ? value : value.text);
            setPopupVisibility(false);
        },
        [onChange, added, setAdded, multiple, inputRef, setInputValue, setPopupVisibility],
    );

    const [onESC] = useKeyboard([KeyCode.Escape], () => {
        setPopupVisibility(false);
    });

    const onCreateNewOptionClick = async (text: string) => {
        const newOption = await createNewOption(text);
        const newAdded = [...added, { text: newOption.name, value: newOption.id }];
        setAdded(newAdded);
        setInputValue('');
        inputRef.current && inputRef.current.focus();
        onChange && onChange(newAdded);
    };

    const onValueInput = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        onInputChange && onInputChange(e.target.value);
    };

    const onItemRemove = (item: Option) => {
        const newAdded = added.filter(({ value }) => value !== item.value);
        setAdded(newAdded);
        onChange && onChange(newAdded);
    };

    return (
        <span className={s.Autocomplete} ref={ref}>
            <span ref={popupRef} {...onESC}>
                <div className={s.AutocompleteBadgeContainer}>
                    {added.map((item, index) => (
                        <Badge className={s.AutocompleteBadge} size="xl" onClick={() => onItemRemove(item)} key={index}>
                            {item.text}
                        </Badge>
                    ))}
                </div>
                <FormInput
                    label={label}
                    ref={inputRef}
                    onFocus={onTriggerClick}
                    onChange={onValueInput}
                    value={inputValue}
                />
            </span>

            <Popup
                placement="bottom-start"
                visible={popupVisible}
                onClickOutside={onClickOutside}
                reference={popupRef}
                interactive
                arrow={false}
                minWidth={100}
                maxWidth={250}
                offset={[-4, 8]}
            >
                <div className={s.AutocompletePopupContainer} {...onESC}>
                    {filteredItems.length === 0 ? (
                        <ColorizedMenuItem
                            title={createNewOption ? tr('Add {inputValue}', { inputValue }) : tr('no options')}
                            onClick={() => createNewOption && onCreateNewOptionClick(inputValue)}
                        />
                    ) : (
                        filteredItems.map((item, index) => (
                            <ColorizedMenuItem
                                key={index}
                                title={typeof item === 'string' ? item : item.text}
                                onClick={onItemClick(item)}
                            />
                        ))
                    )}
                </div>
            </Popup>
        </span>
    );
}
