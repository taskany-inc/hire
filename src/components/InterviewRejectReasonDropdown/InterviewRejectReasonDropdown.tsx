import { useCallback, useState } from 'react';
import { RejectReason } from '@prisma/client';
import { IconDownSmallSolid, IconUpSmallSolid } from '@taskany/icons';
import {
    Dropdown,
    DropdownPanel,
    DropdownTrigger,
    MenuItem,
    Text,
    Button,
    ListView,
    ListViewItem,
} from '@taskany/bricks/harmony';
import { gray8 } from '@taskany/colors';

import s from './InterviewRejectReasonDropdown.module.css';
import { tr } from './InterviewRejectReasonDropdown.i18n';

interface RejectInterviewStatusProps {
    rejectReasons: RejectReason[];
    onChangeRejectReasons?: (selected: string) => void;
}
export const InterviewRejectReasonDropdown = ({
    rejectReasons,
    onChangeRejectReasons,
}: RejectInterviewStatusProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);
    const standartOptions = rejectReasons?.map((option, index) => ({
        text: option.text,
        id: index,
    }));
    const [selected, setSelected] = useState(standartOptions[0].text);

    const onStateClick = useCallback(
        (option: RejectReason) => {
            selected === option.text ? setSelected(standartOptions[0].text) : setSelected(option.text);

            onChangeRejectReasons?.(option.text);
            setIsOpen(false);
        },
        [onChangeRejectReasons, selected, standartOptions],
    );
    return (
        <div className={s.DropdownRejectStatus}>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <DropdownTrigger
                    renderTrigger={(props) => (
                        <div ref={props.ref} className={s.RejectInterviewHeaderStats}>
                            <Text weight="bold" color={gray8} className={s.StandartComment}>
                                {tr('Standard Comment')}
                            </Text>
                            <Button
                                className={s.ButtonReject}
                                view="default"
                                text={selected}
                                color={gray8}
                                type="button"
                                size="m"
                                onClick={() => setIsOpen((val) => !val)}
                                iconRight={
                                    props.isOpen ? <IconUpSmallSolid size="s" /> : <IconDownSmallSolid size="s" />
                                }
                            />
                        </div>
                    )}
                />
                <DropdownPanel className={s.DropdownPanelRejectStatus}>
                    <ListView>
                        {standartOptions?.map((option) => (
                            <ListViewItem
                                key={option.text}
                                value={option}
                                renderItem={({ active, hovered, ...props }) => (
                                    <MenuItem
                                        hovered={active || hovered}
                                        onClick={() => onStateClick(option)}
                                        key={option.id}
                                        {...props}
                                    >
                                        {option.text}
                                    </MenuItem>
                                )}
                            />
                        ))}
                    </ListView>
                </DropdownPanel>
            </Dropdown>
        </div>
    );
};
