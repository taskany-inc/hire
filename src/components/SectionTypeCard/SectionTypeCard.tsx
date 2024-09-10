import { useState, VFC } from 'react';
import { SectionType } from '@prisma/client';
import { Card, CardInfo, CardContent, Text } from '@taskany/bricks/harmony';
import { IconCircleOutline, IconTickCircleOutline } from '@taskany/icons';

import { useDeleteSectionTypeMutation } from '../../modules/sectionTypeHooks';
import { CardHeader } from '../CardHeader/CardHeader';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { TitleMenuItem } from '../TitleMenu/TitleMenu';
import { UpdateSectionTypeModal } from '../SectionTypeForm/SectionTypeForm';
import config from '../../config';

import { tr } from './SectionTypeCard.i18n';
import s from './SectionTypeCard.module.css';

const CheckboxLine = ({ value, text }: { value: boolean; text: string }) => (
    <Text className={s.CheckboxLineCenteredText}>
        {value ? (
            <div className={s.CheckboxLineIconCircleWrapper}>
                <IconTickCircleOutline size="s" />
            </div>
        ) : (
            <div className={s.CheckboxLineIconCircleWrapper}>
                <IconCircleOutline size="s" />
            </div>
        )}{' '}
        {text}
    </Text>
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

    const menu: TitleMenuItem[] = [
        { onClick: () => setUpdateModalOpen(true), text: tr('Edit') },
        { onClick: deleteConfirmation.show, text: tr('Delete') },
    ];

    return (
        <>
            <Card>
                <CardInfo>
                    <CardHeader
                        title={sectionType.title}
                        subTitle={
                            <span style={{ color: sectionType.eventColor ?? undefined }}>{sectionType.value}</span>
                        }
                        menu={menu}
                    />
                </CardInfo>
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
