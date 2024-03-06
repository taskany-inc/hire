import { Text, Badge, Table, TableCell, TableRow } from '@taskany/bricks';

import { SectionWithSectionType } from '../../modules/sectionTypes';
import { generatePath, Paths } from '../../utils/paths';
import { SectionStatusTagPalette } from '../../utils/tagPalette';
import { GradeButton } from '../GradeButton';
import { Link } from '../Link';
import { getSectionChip } from '../helpers';

import { tr } from './SectionResults.i18n';

interface SectionResultsProps {
    passedSections: SectionWithSectionType[];
}

const sectionColumnWidth = '250px';
const interviewerColumnWidth = '150px';

export const SectionResults = ({ passedSections }: SectionResultsProps): JSX.Element | null => {
    if (passedSections.length === 0) {
        return null;
    }

    return (
        <>
            <Text size="xl">{tr('Passed sections')}</Text>

            <Table gap={10} width={600}>
                <TableRow align="center" gap={10}>
                    <TableCell width={sectionColumnWidth}>{tr('Section')}</TableCell>
                    <TableCell width={interviewerColumnWidth}>{tr('Interviewer')}</TableCell>
                    <TableCell justify="center">{tr('Hire')}</TableCell>
                    <TableCell justify="center">{tr('Grade')}</TableCell>
                </TableRow>
                {passedSections.map((passedSection) => (
                    <TableRow key={passedSection.id} align="center" gap={10}>
                        <TableCell width={sectionColumnWidth}>
                            <Link
                                href={generatePath(Paths.SECTION, {
                                    interviewId: passedSection.interviewId,
                                    sectionId: passedSection.id,
                                })}
                            >
                                {passedSection.sectionType.title}
                            </Link>
                        </TableCell>
                        <TableCell width={interviewerColumnWidth}>{passedSection.interviewer.name}</TableCell>
                        <TableCell justify="center">
                            <Badge size="m" color={SectionStatusTagPalette[getSectionChip(passedSection)]}>
                                {getSectionChip(passedSection)}
                            </Badge>
                        </TableCell>
                        <TableCell justify="center">
                            {passedSection.grade && (
                                <GradeButton type="button" matching>
                                    {passedSection.grade}
                                </GradeButton>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </Table>
        </>
    );
};
