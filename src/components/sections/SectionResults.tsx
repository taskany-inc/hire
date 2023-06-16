import styled from 'styled-components';
import { textColor } from '@taskany/colors';
import { Text, Link, Badge } from '@taskany/bricks';

import { GradeButton } from '../GradeButton';
import { SectionWithSectionType } from '../../backend/modules/section/section-types';
import { generatePath, Paths } from '../../utils/paths';
import { Stack } from '../layout/Stack';
import { SectionStatusTagPalette } from '../../utils/tag-palette';

import { getSectionChip } from './helpers';

type SectionResultsProps = {
    passedSections: SectionWithSectionType[];
};

const StyledTable = styled.div`
    max-width: 460px;
    color: ${textColor};
`;

const StyledRow = styled.div`
    display: flex;
    border-bottom: 1px solid ${textColor};
    width: 100%;
    align-items: center;
`;

const StyledTableCell = styled.div<{ interviewer?: boolean; grade?: boolean }>`
    width: ${({ interviewer }) => (interviewer ? '40%' : '20%')};
    padding: 6px;
    text-align: ${({ grade }) => (grade ? 'center' : 'start')};
`;

export const SectionResults = ({ passedSections }: SectionResultsProps): JSX.Element | null => {
    if (passedSections.length === 0) {
        return null;
    }

    return (
        <>
            <Stack direction="row" gap={12} justifyContent="flex-start" align="center">
                <Text size="xl">Passed sections</Text>
            </Stack>

            <StyledTable>
                <StyledRow>
                    <StyledTableCell>Section</StyledTableCell>
                    <StyledTableCell interviewer>Interviewer</StyledTableCell>
                    <StyledTableCell>Hire</StyledTableCell>
                    <StyledTableCell grade>Grade</StyledTableCell>
                </StyledRow>
                {passedSections.map((passedSection) => {
                    const grade = Number(passedSection.grade?.slice(1));
                    const sectionChip = getSectionChip(passedSection);

                    return (
                        <StyledRow key={passedSection.id}>
                            <StyledTableCell>
                                <Link
                                    inline
                                    href={generatePath(Paths.SECTION, {
                                        interviewId: passedSection.interviewId,
                                        sectionId: passedSection.id,
                                    })}
                                >
                                    {passedSection.sectionType.title}
                                </Link>
                            </StyledTableCell>
                            <StyledTableCell interviewer>{passedSection.interviewer.name}</StyledTableCell>
                            <StyledTableCell>
                                <Badge color={SectionStatusTagPalette[sectionChip]}>{sectionChip}</Badge>
                            </StyledTableCell>
                            <StyledTableCell grade>
                                {!Number.isNaN(grade) && (
                                    <GradeButton type="button" matching>
                                        {grade}
                                    </GradeButton>
                                )}
                            </StyledTableCell>
                        </StyledRow>
                    );
                })}
            </StyledTable>
        </>
    );
};
