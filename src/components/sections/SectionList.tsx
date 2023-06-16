import styled from 'styled-components';
import { Text } from '@taskany/bricks';

import { SectionWithInterviewRelation } from '../../backend/modules/interview/interview-types';
import { Stack } from '../layout/Stack';
import { generatePath, Paths } from '../../utils/paths';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { Card } from '../card/Card';
import { CardHeader } from '../card/CardHeader';
import { CardContent } from '../card/CardContent';

import { SectionFeedbackHireBadge, SectionTypeBadge } from './SectionFeedbackHireBadge';

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
                <StyledTitle style={{ marginLeft: 40 }} size="l" completed={completed}>
                    {header}
                </StyledTitle>
            )}

            <Stack direction="column" gap={8}>
                {sections.length === 0 ? (
                    <Text style={{ marginLeft: 40 }}>No sections yet 😴</Text>
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
