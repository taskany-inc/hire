import styled from 'styled-components';
import { nullable, Text } from '@taskany/bricks';
import { gapS } from '@taskany/colors';

import { SectionWithInterviewRelation } from '../../modules/interviewTypes';
import { generatePath, Paths } from '../../utils/paths';
import { Stack } from '../Stack';
import { Card } from '../Card/Card';
import { CardHeader } from '../CardHeader/CardHeader';
import { SectionFeedbackHireBadge, SectionTypeBadge } from '../SectionFeedbackHireBadge/SectionFeedbackHireBadge';
import Md from '../Md';

import { tr } from './SectionList.i18n';

interface SectionListProps {
    sections: SectionWithInterviewRelation[];
    header?: string;
    completed?: boolean;
}

const StyledTitle = styled(Text)<{ completed: boolean }>`
    margin-left: ${gapS};
    margin-top: ${({ completed }) => (completed ? 60 : 0)};
    opacity: ${({ completed }) => (completed ? 0.6 : 1)};
`;

const StyledOpacityCard = styled(Card)<{ completed: boolean }>`
    opacity: ${({ completed }) => (completed ? 0.6 : 1)};

    &:hover {
        opacity: 1;
    }
`;

const StyledWrapper = styled.div`
    margin: ${gapS} 0 0 ${gapS};
`;

export const SectionList = ({ sections, header, completed = false }: SectionListProps) => {
    return (
        <div>
            {header && (
                <StyledTitle size="l" completed={completed}>
                    {header}
                </StyledTitle>
            )}

            <Stack direction="column" gap={7}>
                {sections.length === 0 ? (
                    <StyledWrapper>
                        <Text>{tr('No sections yet')} 😴</Text>
                    </StyledWrapper>
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

                                <div>
                                    {nullable(section.interview.description, (d) => (
                                        <Md>{d}</Md>
                                    ))}
                                </div>
                            </StyledOpacityCard>
                        );
                    })
                )}
            </Stack>
        </div>
    );
};
