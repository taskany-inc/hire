import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';
import cn from 'classnames';

import { SectionWithInterviewRelation } from '../../modules/interviewTypes';
import { generatePath, Paths } from '../../utils/paths';
import { Stack } from '../Stack';
import { Card } from '../Card/Card';
import { CardHeader } from '../CardHeader/CardHeader';
import { SectionFeedbackHireBadge, SectionTypeBadge } from '../SectionFeedbackHireBadge/SectionFeedbackHireBadge';
import Md from '../Md';
import { Link } from '../Link';

import { tr } from './SectionList.i18n';
import s from './SectionList.module.css';

interface SectionListProps {
    sections: SectionWithInterviewRelation[];
    header?: string;
    completed?: boolean;
}

export const SectionList = ({ sections, header, completed = false }: SectionListProps) => {
    return (
        <div>
            {header && (
                <Text size="l" className={cn(s.SectionListTitle, { [s.SectionListTitleCompleted]: completed })}>
                    {header}
                </Text>
            )}

            <Stack direction="column" gap={7}>
                {sections.length === 0 ? (
                    <div className={s.SectionListWrapper}>
                        <Text>{tr('No sections yet')} 😴</Text>
                    </div>
                ) : (
                    sections.map((section: SectionWithInterviewRelation) => {
                        return (
                            <Card
                                key={section.id}
                                className={cn(s.SectionListOpacityCard, {
                                    [s.SectionListOpacityCardCompleted]: completed,
                                })}
                            >
                                <CardHeader
                                    title={
                                        <Link
                                            href={generatePath(Paths.SECTION, {
                                                interviewId: section.interviewId,
                                                sectionId: section.id,
                                            })}
                                        >
                                            {section.interview.candidate.name}
                                        </Link>
                                    }
                                    chips={[
                                        <SectionFeedbackHireBadge hire={section.hire} key="hire" />,
                                        section.sectionType && (
                                            <SectionTypeBadge sectionType={section.sectionType} key="type" />
                                        ),
                                    ]}
                                />

                                <div>
                                    {nullable(section.interview.description, (d) => (
                                        <Md>{d}</Md>
                                    ))}
                                </div>
                            </Card>
                        );
                    })
                )}
            </Stack>
        </div>
    );
};
