import { useRef, useState } from 'react';
import { nullable } from '@taskany/bricks';
import { Badge, Popup, Text } from '@taskany/bricks/harmony';
import { IconXCircleOutline, IconUserSquareOutline } from '@taskany/icons';

import { Vacancy } from '../../modules/crewTypes';
import { useVacancy } from '../../modules/crewHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { useInterviewUpdateMutation } from '../../modules/interviewHooks';

import { tr } from './VacancyInfo.i18n';

interface VacancyInfoProps {
    vacancy: Vacancy;
    interviewId?: number;
    isEditable?: boolean;
}

export const VacancyInfo = ({ vacancy, interviewId, isEditable }: VacancyInfoProps) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const [popupVisible, setPopupVisibility] = useState(false);
    const interviewUpdateMutation = useInterviewUpdateMutation();
    const onDelete = (id: number) => {
        interviewUpdateMutation.mutate({ data: { interviewId: id, crewVacancyId: null } });
    };

    return (
        <>
            <Badge
                iconLeft={<IconUserSquareOutline size="xs" />}
                iconRight={nullable(isEditable && interviewId, (id) => (
                    <IconXCircleOutline size="xs" onClick={() => onDelete(id)} />
                ))}
                action="dynamic"
                text={vacancy.name}
                ref={popupRef}
                onMouseEnter={() => setPopupVisibility(true)}
                onMouseLeave={() => setPopupVisibility(false)}
            />
            <Popup arrow={true} reference={popupRef} visible={popupVisible} placement="bottom-start">
                <Text>
                    {tr('Grade')}: {vacancy.grade}
                </Text>
                <Text>
                    {tr('Unit')}: {vacancy.unit}
                </Text>
            </Popup>
        </>
    );
};

type VacancyInfoByIdProps = Omit<VacancyInfoProps, 'vacancy'> & {
    vacancyId: string;
};

export const VacancyInfoById = ({ vacancyId, ...restProps }: VacancyInfoByIdProps) => {
    const vacancyQuery = useVacancy(vacancyId);

    return (
        <QueryResolver queries={[vacancyQuery]}>
            {([vacancy]) => <VacancyInfo vacancy={vacancy} {...restProps} />}
        </QueryResolver>
    );
};
