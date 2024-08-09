import { useMemo, useState } from 'react';
import { RejectReason } from '@prisma/client';
import { Text, Select, SelectTrigger, SelectPanel, Input } from '@taskany/bricks/harmony';

import s from './InterviewRejectReasonDropdown.module.css';
import { tr } from './InterviewRejectReasonDropdown.i18n';

interface RejectInterviewStatusProps {
    rejectReasons: RejectReason[];
    onChange?: (selected: string) => void;
    value: string;
}

export const InterviewRejectReasonDropdown = ({
    rejectReasons,
    onChange,
    value,
}: RejectInterviewStatusProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);

    const items = useMemo(() => {
        const result = rejectReasons.reduce<{ id: string; text: string }[]>((textes, reason) => {
            if (reason.text.toLocaleLowerCase().includes(value.toLocaleLowerCase())) {
                textes.push({ text: reason.text, id: textes.length.toString() });
            }

            return textes;
        }, []);
        if (!result.length) {
            result.push({ text: value, id: result.length.toString() });
        }

        return result;
    }, [rejectReasons, value]);

    return (
        <div className={s.DropdownRejectStatus}>
            <Select
                items={items}
                isOpen={isOpen}
                onChange={(item) => {
                    const { text } = item[0];
                    onChange?.(text ?? value);
                }}
                onClose={() => setIsOpen(false)}
                mode="single"
                renderItem={({ item }) => <Text size="xs">{item.text}</Text>}
            >
                <SelectTrigger
                    className={s.Input}
                    renderTrigger={(props) => (
                        <div className={s.RejectInterviewHeaderStats}>
                            <Input
                                placeholder={tr('Choose reject reason or enter a new reason')}
                                className={s.Input}
                                value={value}
                                onChange={(e) => {
                                    onChange?.(e.target.value);
                                }}
                                autoFocus
                                size="m"
                                onClick={props.onClick}
                                ref={props.ref}
                                view="default"
                            />
                        </div>
                    )}
                />
                <SelectPanel placement="top-start" className={s.DropdownPanelRejectStatus} />
            </Select>
        </div>
    );
};
