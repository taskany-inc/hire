import { useMemo, useState } from 'react';
import { RejectReason } from '@prisma/client';
import { Text, Select, SelectTrigger, SelectPanel, Input } from '@taskany/bricks/harmony';

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
    const [search, setSearch] = useState<string>('');
    const [selectedRejectReason, setSelectedRejectReason] = useState<string>();

    const items = useMemo(() => {
        const result = rejectReasons.filter(({ text }) =>
            text.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
        );
        if (!result.length) {
            result.push({
                text: search,
                id: -1,
            });
        }

        return result.map((option, index) => ({ text: option.text, id: index.toString() }));
    }, [rejectReasons, search]);

    return (
        <div className={s.DropdownRejectStatus}>
            <Select
                items={items}
                isOpen={isOpen}
                onChange={(item) => {
                    const { text } = item[0];
                    setSearch(text);
                    setSelectedRejectReason(text);
                    onChangeRejectReasons?.(text);
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
                                className={s.Iput}
                                value={selectedRejectReason ?? search}
                                onChange={(e) => {
                                    setSelectedRejectReason(undefined);
                                    setSearch(e.target.value);
                                }}
                                size="m"
                                onClick={props.onClick}
                                ref={props.ref}
                                view="default"
                                title="text"
                            />
                        </div>
                    )}
                />
                <SelectPanel placement="top-start" className={s.DropdownPanelRejectStatus} />
            </Select>
        </div>
    );
};
