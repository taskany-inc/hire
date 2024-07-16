import { Text, Table, TableCell, TableRow, Dot, Checkbox } from '@taskany/bricks/harmony';
import { FC } from 'react';

import { SectionWithSectionType } from '../../modules/sectionTypes';
import { generatePath, Paths } from '../../utils/paths';
import { Link } from '../Link';
import { Avatar } from '../Avatar/Avatar';

import { tr } from './SectionResults.i18n';
import s from './SectionResults.module.css';

interface SectionResultsProps {
    passedSections: SectionWithSectionType[];
    className?: string;
}

export const SectionResults: FC<SectionResultsProps> = ({ passedSections, className }): JSX.Element | null => {
    if (passedSections.length === 0) {
        return null;
    }
    return (
        <>
            <Text size="xl">{tr('Passed sections')}</Text>

            <Table className={className}>
                <TableRow className={s.Column}>
                    <TableCell width={300} className={s.Column}>
                        {tr('Section')}
                    </TableCell>
                    <TableCell width={300} className={s.Column}>
                        {tr('Interviewer')}
                    </TableCell>
                    <TableCell width={250} className={s.Column}>
                        {tr('Grade')}
                    </TableCell>
                </TableRow>
                {passedSections.map((passedSection) => (
                    <TableRow className={s.TableRow} key={passedSection.id}>
                        <TableCell width={300} className={s.Column}>
                            <Link
                                href={generatePath(Paths.SECTION, {
                                    interviewId: passedSection.interviewId,
                                    sectionId: passedSection.id,
                                })}
                            >
                                <Checkbox view="rounded" label={passedSection.sectionType.title} defaultChecked />
                            </Link>
                            <Dot size="l" />
                        </TableCell>
                        <TableCell width={300}>
                            <Avatar
                                className={s.Avatar}
                                short
                                tooltip={passedSection.interviewer.name}
                                size="s"
                                email={passedSection.interviewer.email}
                                name={passedSection.interviewer.name}
                            />
                        </TableCell>
                        <TableCell>
                            {passedSection.grade && (
                                <Text className={s.Badge} size="s">
                                    {passedSection.grade}
                                </Text>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </Table>
        </>
    );
};
