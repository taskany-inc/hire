import { nullable, Text } from '@taskany/bricks';
import { gray9, textColor } from '@taskany/colors';
import { Badge } from '@taskany/bricks/harmony';
import { IconXCircleOutline } from '@taskany/icons';

import { Vacancy } from '../../modules/crewTypes';
import { useVacancy } from '../../modules/crewHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';

import { tr } from './VacancyInfo.i18n';

interface VacancyInfoProps {
    vacancy: Vacancy;
    onClick?: () => void;
}

export const VacancyInfo = ({ vacancy, onClick }: VacancyInfoProps) => {
    return (
        <div>
            <Text color={gray9} weight="bold">
                {tr('Vacancy')}:{' '}
                <Badge
                    color={textColor}
                    text={vacancy.name}
                    iconRight={nullable(onClick, () => (
                        <IconXCircleOutline size="xs" onClick={onClick} />
                    ))}
                />
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

export const VacancyInfoById = ({ vacancyId, onClick }: { vacancyId: string; onClick?: () => void }) => {
    const vacancyQuery = useVacancy(vacancyId);

    return (
        <QueryResolver queries={[vacancyQuery]}>
            {([vacancy]) => <VacancyInfo vacancy={vacancy} onClick={onClick} />}
        </QueryResolver>
    );
};
