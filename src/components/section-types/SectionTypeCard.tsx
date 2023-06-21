import { useState, VFC } from 'react';
import { SectionType } from '@prisma/client';
import styled from 'styled-components';
import { Text, CircleIcon, TickCircleIcon } from '@taskany/bricks';

import { Card } from '../card/Card';
import { CardHeader } from '../card/CardHeader';
import { CardContent } from '../card/CardContent';
import { useDeleteSectionTypeMutation } from '../../hooks/section-type-hooks';
import { Confirmation, useConfirmation } from '../Confirmation';
import { DropdownMenuItem } from '../TagFilterDropdown';

import { UpdateSectionTypeModal } from './SectionTypeForm';

import { tr } from './section-types.i18n';

const StyledCircleIcon = styled(CircleIcon)`
    margin-top: 4px;
`;

const StyledTickCircleIcon = styled(TickCircleIcon)`
    margin-top: 4px;
`;

const CenteredText = styled(Text)`
    display: flex;
    align-content: center;
    gap: 8px;
    padding: 4px 0;
`;

const CheckboxLine = ({ value, text }: { value: boolean; text: string }) => (
    <CenteredText>
        {value ? <StyledTickCircleIcon size="s" /> : <StyledCircleIcon size="s" />} {text}
    </CenteredText>
);

type SectionTypeCardProps = {
    sectionType: SectionType;
};

export const SectionTypeCard: VFC<SectionTypeCardProps> = ({ sectionType }) => {
    const deleteSectionType = useDeleteSectionTypeMutation();
    const deleteConfirmation = useConfirmation({
        message: `${tr('Delete section type')} ${sectionType.title}?`,
        onAgree: () => deleteSectionType.mutateAsync({ sectionTypeId: sectionType.id }),
        destructive: true,
    });

    const [updateModalOpen, setUpdateModalOpen] = useState(false);

    const menu: DropdownMenuItem[] = [
        { onClick: () => setUpdateModalOpen(true), text: tr('Edit') },
        { onClick: deleteConfirmation.show, text: tr('Delete') },
    ];

    return (
        <>
            <Card>
                <CardHeader
                    title={sectionType.title}
                    subTitle={<span style={{ color: sectionType.eventColor ?? undefined }}>{sectionType.value}</span>}
                    menu={menu}
                />
                <CardContent>
                    <CheckboxLine value={sectionType.hasTasks} text={tr('Contains problems')} />
                    <CheckboxLine value={sectionType.userSelect} text={tr('Team selection')} />
                    <CheckboxLine value={sectionType.showOtherGrades} text={tr('Show results of other sections')} />
                    <CheckboxLine value={sectionType.schedulable} text={tr('Appointment via calendar')} />
                    <span>
                        {tr('Section grades: ')}
                        {sectionType.gradeOptions.join(', ')}
                    </span>
                </CardContent>
            </Card>

            <UpdateSectionTypeModal
                open={updateModalOpen}
                onClose={() => setUpdateModalOpen(false)}
                sectionType={sectionType}
            />
            <Confirmation {...deleteConfirmation.props} />
        </>
    );
};
