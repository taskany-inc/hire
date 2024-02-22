import { useMemo } from 'react';
import { Badge, Button, Text, nullable } from '@taskany/bricks';
import { gapS, gray10, textColor } from '@taskany/colors';
import styled from 'styled-components';

import { Vacancy, vacancyLabels, vacancyStatusColors } from '../../modules/crewTypes';
import { Card } from '../Card';
import { CardHeader } from '../CardHeader';
import { CardContent } from '../CardContent';
import { InlineDot } from '../InlineDot';
import { useHireStreams } from '../../modules/hireStreamsHooks';

import { tr } from './VacancyCard.i18n';

interface VacancyCardProps {
    vacancy: Vacancy;
    onSelect?: (vacancy: Vacancy) => void;
}

const StyledButton = styled(Button)`
    margin-top: ${gapS};
`;

export const VacancyCard = ({ vacancy, onSelect }: VacancyCardProps) => {
    const hireStreamsQuery = useHireStreams();

    const stream = useMemo(
        () => hireStreamsQuery.data?.find((s) => s.id === parseInt(vacancy.hireStreamId, 10)),
        [vacancy.hireStreamId, hireStreamsQuery.data],
    );

    return (
        <Card>
            <CardHeader
                title={vacancy.name}
                subTitle={
                    <>
                        {tr('Hiring manager')}: {vacancy.hiringManager.name}
                        <InlineDot />
                        {tr('HR')}: {vacancy.hr.name}
                        <InlineDot />
                        {stream?.name}
                    </>
                }
                chips={
                    <Badge size="l" color={vacancyStatusColors[vacancy.status]}>
                        {vacancyLabels[vacancy.status]}
                    </Badge>
                }
            />
            <CardContent>
                <Text color={gray10}>
                    {tr('Unit')}:{' '}
                    <Text color={textColor} as="span">
                        {vacancy.unit}
                    </Text>
                </Text>
                <Text color={gray10}>
                    {tr('Grade')}:{' '}
                    <Text color={textColor} as="span">
                        {vacancy.grade}
                    </Text>
                </Text>

                {nullable(onSelect, (cb) => (
                    <StyledButton text={tr('Select')} onClick={() => cb(vacancy)} />
                ))}
            </CardContent>
        </Card>
    );
};
