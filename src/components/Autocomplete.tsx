import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { Button, Input, useKeyboard, KeyCode, Badge } from '@taskany/bricks';

import { Option } from '../types';

const Popup = dynamic(() => import('@taskany/bricks/components/Popup'));

import { tr } from './components.i18n';

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
}

const StyledDropdown = styled.span`
    position: relative;
    display: inline-block;
    width: 100%;
`;

const StyledButton = styled(Button)`
    width: 100%;
    border: none;
`;

const StyledBadgeContainer = styled.div`
    display: flex;
    padding-top: 4px;
`;

const StyledBadge = styled(Badge)`
    margin: 2px;
`;

const StyledPopupContainer = styled.div`
    max-height: 200;
    overflow-y: auto;
`;

export function Autocomplete({
    visible = false,
    onChange,
    ref,
    createNewOption,
    multiple,
    options,
    value = [],
    onInputChange,
    placeholder,
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
        <StyledDropdown ref={ref}>
            <span ref={popupRef} {...onESC}>
                <Input
                    ref={inputRef}
                    onFocus={onTriggerClick}
                    onChange={onValueInput}
                    value={inputValue}
                    placeholder={placeholder}
                />
                <StyledBadgeContainer>
                    {added.map((item, index) => (
                        <StyledBadge onClick={() => onItemRemove(item)} key={index}>
                            {item.text}
                        </StyledBadge>
                    ))}
                </StyledBadgeContainer>
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
                <StyledPopupContainer {...onESC}>
                    {filteredItems.length === 0 ? (
                        <StyledButton
                            type="button"
                            disabled={!createNewOption}
                            text={createNewOption ? tr('Add {value}', { inputValue }) : tr('no options')}
                            onClick={() => onCreateNewOptionClick(inputValue)}
                        />
                    ) : (
                        filteredItems.map((item, index) => (
                            <StyledButton
                                type="button"
                                text={typeof item === 'string' ? item : item.text}
                                key={index}
                                onClick={onItemClick(item)}
                            />
                        ))
                    )}
                </StyledPopupContainer>
            </Popup>
        </StyledDropdown>
    );
}
