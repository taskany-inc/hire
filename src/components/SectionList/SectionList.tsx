import styled from 'styled-components';
import { Text } from '@taskany/bricks';

import { SectionWithInterviewRelation } from '../../modules/interviewTypes';
import { generatePath, Paths } from '../../utils/paths';
import { Stack } from '../Stack';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { Card } from '../Card';
import { CardHeader } from '../CardHeader';
import { CardContent } from '../CardContent';
import { SectionFeedbackHireBadge, SectionTypeBadge } from '../SectionFeedbackHireBadge/SectionFeedbackHireBadge';

import { tr } from './SectionList.i18n';

type SectionListProps = {
    sections: SectionWithInterviewRelation[];
    header?: string;
    completed?: boolean;
};

const StyledTitle = styled(Text)<{ completed: boolean }>`
    margin-bottom: 24px;
    margin-top: ${({ completed }) => (completed ? 60 : 0)};
    opacity: ${({ completed }) => (completed ? 0.6 : 1)};
`;

const StyledOpacityCard = styled(Card)<{ completed: boolean }>`
    opacity: ${({ completed }) => (completed ? 0.6 : 1)};

    &:hover {
        opacity: 1;
    }
`;

export const SectionList = ({ sections, header, completed = false }: SectionListProps) => {
    return (
        <div>
            {header && (
                <StyledTitle size="l" completed={completed}>
                    {header}
                </StyledTitle>
            )}

            <Stack direction="column" gap={8}>
                {sections.length === 0 ? (
                    <Text>{tr('No sections yet')} 😴</Text>
                ) : (
                    sections.map((section: SectionWithInterviewRelation) => {
                        return (
                            <StyledOpacityCard key={section.id} completed={completed}>
                                <CardHeader
                                    title={section.interview.candidate.name}
                                    link={generatePath(Paths.SECTION, {
                                        interviewId: section.interviewId,
                                        sectionId: section.id,
                                    })}
                                    chips={[
                                        <SectionFeedbackHireBadge hire={section.hire} key="hire" />,
                                        section.sectionType && (
                                            <SectionTypeBadge sectionType={section.sectionType} key="type" />
                                        ),
                                    ]}
                                />

                                <CardContent>
                                    {section.interview.description && (
                                        <MarkdownRenderer value={section.interview.description} />
                                    )}
                                </CardContent>
                            </StyledOpacityCard>
                        );
                    })
                )}
            </Stack>
        </div>
    );
};
