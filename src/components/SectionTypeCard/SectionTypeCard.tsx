import { useState, VFC } from 'react';
import { SectionType } from '@prisma/client';
import styled from 'styled-components';
import { Text } from '@taskany/bricks';
import { IconCircleOutline, IconTickCircleOutline } from '@taskany/icons';

import { useDeleteSectionTypeMutation } from '../../modules/sectionTypeHooks';
import { Card } from '../Card';
import { CardHeader } from '../CardHeader';
import { CardContent } from '../CardContent';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { DropdownMenuItem } from '../TagFilterDropdown';
import { UpdateSectionTypeModal } from '../SectionTypeForm/SectionTypeForm';
import config from '../../config';

import { tr } from './SectionTypeCard.i18n';

const IconCircleWrapper = styled.div`
    margin-top: 2px;
`;

const CenteredText = styled(Text)`
    display: flex;
    align-content: center;
    gap: 8px;
    padding: 4px 0;
`;

const CheckboxLine = ({ value, text }: { value: boolean; text: string }) => (
    <CenteredText>
        {value ? (
            <IconCircleWrapper>
                <IconTickCircleOutline size="s" />
            </IconCircleWrapper>
        ) : (
            <IconCircleWrapper>
                <IconCircleOutline size="s" />
            </IconCircleWrapper>
        )}{' '}
        {text}
    </CenteredText>
);

interface SectionTypeCardProps {
    sectionType: SectionType;
}

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
                    <CheckboxLine
                        value={sectionType.giveAchievement}
                        text={tr('Give achievement for every {amount} finished sections', {
                            amount: config.crew.sectionAmountForAchievement,
                        })}
                    />
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
