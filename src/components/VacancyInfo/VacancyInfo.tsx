import { Text } from '@taskany/bricks';
import { gray9, textColor } from '@taskany/colors';

import { Vacancy } from '../../modules/crewTypes';
import { useVacancy } from '../../modules/crewHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';

import { tr } from './VacancyInfo.i18n';

interface VacancyInfoProps {
    vacancy: Vacancy;
}

export const VacancyInfo = ({ vacancy }: VacancyInfoProps) => {
    return (
        <div>
            <Text color={gray9} weight="bold">
                {tr('Vacancy')}:{' '}
                <Text as="span" color={textColor}>
                    {vacancy.name}
                </Text>
            </Text>
            <Text color={gray9}>
                {tr('Grade')}:{' '}
                <Text as="span" color={textColor}>
                    {vacancy.grade}
                </Text>
            </Text>
            <Text color={gray9}>
                {tr('Unit')}:{' '}
                <Text as="span" color={textColor}>
                    {vacancy.unit}
                </Text>
            </Text>
        </div>
    );
};

export const VacancyInfoById = ({ vacancyId }: { vacancyId: string }) => {
    const vacancyQuery = useVacancy(vacancyId);

    return <QueryResolver queries={[vacancyQuery]}>{([vacancy]) => <VacancyInfo vacancy={vacancy} />}</QueryResolver>;
};
