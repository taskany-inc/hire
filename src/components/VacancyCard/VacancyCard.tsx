import { useMemo } from 'react';
import { nullable } from '@taskany/bricks';
import { gray10, textColor } from '@taskany/colors';
import { Button, Card, CardContent, CardInfo, Text, Badge } from '@taskany/bricks/harmony';

import { Vacancy, vacancyLabels, vacancyStatusColors } from '../../modules/crewTypes';
import { CardHeader } from '../CardHeader/CardHeader';
import { InlineDot } from '../InlineDot';
import { useHireStreams } from '../../modules/hireStreamsHooks';
import { Paths } from '../../utils/paths';
import { Link } from '../Link';
import config from '../../config';

import { tr } from './VacancyCard.i18n';
import s from './VacancyCard.module.css';

interface VacancyCardProps {
    vacancy: Vacancy;
    onSelect?: (vacancy: Vacancy) => void;
}

export const VacancyCard = ({ vacancy, onSelect }: VacancyCardProps) => {
    const hireStreamsQuery = useHireStreams();

    const stream = useMemo(
        () => hireStreamsQuery.data?.find((s) => s.id === parseInt(vacancy.hireStreamId, 10)),
        [vacancy.hireStreamId, hireStreamsQuery.data],
    );

    return (
        <Card>
            <CardInfo>
                <CardHeader
                    title={<Link href={`${Paths.CANDIDATES}?vacancyIds=${vacancy.id}`}>{vacancy.name}</Link>}
                    subTitle={
                        <div className={s.VacancyCardInfoLine}>
                            {tr('Hiring manager')}: {vacancy.hiringManager.name}
                            <InlineDot />
                            {tr('HR')}: {vacancy.hr.name}
                            {nullable(stream?.name, (s) => (
                                <>
                                    <InlineDot />
                                    {s}
                                </>
                            ))}
                        </div>
                    }
                    chips={
                        <Badge
                            size="s"
                            view="outline"
                            color={vacancyStatusColors[vacancy.status]}
                            text={vacancyLabels[vacancy.status]}
                        />
                    }
                    className={s.VacancyCardHeader}
                />
            </CardInfo>

            <CardContent>
                {nullable(vacancy.unit, (unit) => (
                    <Text color={gray10}>
                        {tr('Unit')}:{' '}
                        <Text color={textColor} as="span">
                            {unit}
                        </Text>
                    </Text>
                ))}
                {nullable(vacancy.grade, (grade) => (
                    <Text color={gray10}>
                        {tr('Grade')}:{' '}
                        <Text color={textColor} as="span">
                            {grade}
                        </Text>
                    </Text>
                ))}
                <Text color={gray10}>
                    {tr('Team')}:{' '}
                    <Link href={`${config.crew.url}/teams/${vacancy.group.id}`} target="_blank">
                        <Text color={textColor} as="span">
                            {vacancy.group.name}
                        </Text>
                    </Link>
                </Text>

                {nullable(onSelect, (cb) => (
                    <Button className={s.VacancyCardSelectButton} text={tr('Select')} onClick={() => cb(vacancy)} />
                ))}
            </CardContent>
        </Card>
    );
};
