import { FC } from 'react';
import cn from 'classnames';
import { Text, Table, TableCell, TableRow, Dot, Badge } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';
import { IconCircleOutline, IconMinusCircleOutline, IconTickCircleOutline } from '@taskany/icons';

import { SectionWithSectionType } from '../../modules/sectionTypes';
import { generatePath, Paths } from '../../utils/paths';
import { Link } from '../Link';
import { Avatar } from '../Avatar';

import { tr } from './SectionResults.i18n';
import s from './SectionResults.module.css';

interface SectionResultsProps {
    passedSections: SectionWithSectionType[];
    gradeVisibility?: boolean;
    className?: string;
}

const getIconComponent = (hire: boolean | null) => {
    if (hire === null) {
        return IconCircleOutline;
    }
    return hire ? IconTickCircleOutline : IconMinusCircleOutline;
};

export const SectionResults: FC<SectionResultsProps> = ({
    passedSections,
    gradeVisibility,
    className,
}): JSX.Element | null => {
    if (passedSections.length === 0) {
        return null;
    }

    return (
        <Table className={cn(className, s.SectionResults)}>
            <TableRow className={s.TableRow}>
                <TableCell className={s.Column}>{tr('Section')}</TableCell>
                <TableCell>{tr('Interviewer')}</TableCell>
                {nullable(gradeVisibility, () => (
                    <TableCell className={s.Column} width={50}>
                        {tr('Grade')}
                    </TableCell>
                ))}
            </TableRow>
            {passedSections.map((passedSection) => {
                const Icon = getIconComponent(passedSection.hire);

                return (
                    <TableRow className={s.TableRow} key={passedSection.id}>
                        <TableCell className={s.Column}>
                            <Link
                                href={generatePath(Paths.SECTION, {
                                    interviewId: passedSection.interviewId,
                                    sectionId: passedSection.id,
                                })}
                            >
                                <Badge
                                    className={cn(s.SectionResultsStatus, {
                                        [s.SectionResultsStatus__hired]: passedSection.hire,
                                        [s.SectionResultsStatus__failed]: passedSection.hire === false,
                                    })}
                                    text={passedSection.sectionType.title}
                                    iconLeft={<Icon size="s" />}
                                />
                            </Link>
                            <Dot size="l" />
                        </TableCell>
                        <TableCell className={s.Column}>
                            <Avatar
                                short
                                tooltip={passedSection.interviewer.name}
                                size="s"
                                email={passedSection.interviewer.email}
                                name={passedSection.interviewer.name}
                            />
                        </TableCell>
                        {nullable(gradeVisibility, () => (
                            <TableCell className={s.Column} width={50}>
                                {passedSection.grade && (
                                    <Text className={s.Badge} size="s">
                                        {passedSection.grade}
                                    </Text>
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                );
            })}
        </Table>
    );
};
