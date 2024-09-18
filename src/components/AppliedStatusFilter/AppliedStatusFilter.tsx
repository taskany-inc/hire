import React, { FC } from 'react';
import { AppliedFilter, Select, SelectPanel, SelectTrigger, StateGroup, TagCleanButton } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';
import { InterviewStatus } from '@prisma/client';

import { interviewStatusLabels } from '../../utils/dictionaries';
import { InterviewStatusTagHarmonyPalette } from '../../utils/tagPalette';
import { mapEnum } from '../../utils';
import { InterviewHireState } from '../InterviewHireState';

import { tr } from './AppliedStatusFilter.i18n';

interface AppliedStatusFilterProps {
    onCleanFilter: () => void;
    selectedStatuses: string[] | undefined;
    onChange: (difficulties: { id: string }[]) => void;
    onClose: () => void;
}

const interviewStatuses = mapEnum(InterviewStatus, (key) => ({ id: key }));

export const AppliedStatusFilter: FC<AppliedStatusFilterProps> = ({
    onChange,
    onClose,
    onCleanFilter,
    selectedStatuses,
}) => {
    const value = selectedStatuses?.map((id) => ({ id })) || [];

    return (
        <AppliedFilter label={tr('Status')} action={<TagCleanButton size="s" onClick={onCleanFilter} />}>
            <Select
                arrow
                value={value}
                items={interviewStatuses}
                onClose={onClose}
                onChange={onChange}
                mode="multiple"
                selectable
                renderItem={({ item }) => <InterviewHireState status={item.id as InterviewStatus} />}
            >
                <SelectTrigger>
                    {nullable(
                        value.length > 1,
                        () => (
                            <StateGroup
                                items={value.map((item) => ({
                                    title: interviewStatusLabels[item.id as InterviewStatus],
                                    color: InterviewStatusTagHarmonyPalette[item.id as InterviewStatus],
                                }))}
                            />
                        ),
                        nullable(value[0], (status) => <InterviewHireState status={status.id as InterviewStatus} />),
                    )}
                </SelectTrigger>
                <SelectPanel placement="bottom" />
            </Select>
        </AppliedFilter>
    );
};
