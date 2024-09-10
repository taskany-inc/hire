import { HireStream } from '@prisma/client';
import { Text } from '@taskany/bricks/harmony';

import { useSectionTypes } from '../../modules/sectionTypeHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { NewSectionTypeModal } from '../SectionTypeForm/SectionTypeForm';
import { SectionTypeCard } from '../SectionTypeCard/SectionTypeCard';

import { tr } from './SectionTypeManagement.i18n';
import s from './SectionTypeManagement.module.css';

interface SectionTypeManagementProps {
    hireStream: HireStream;
}

export const SectionTypeManagement = ({ hireStream }: SectionTypeManagementProps) => {
    const sectionTypesQuery = useSectionTypes(hireStream.id);

    return (
        <div className={s.SectionTypeManagement}>
            <Text size="xl">
                {tr('Section types')} <NewSectionTypeModal hireStreamId={hireStream.id} />
            </Text>

            <QueryResolver queries={[sectionTypesQuery]}>
                {([sectionTypes]) => (
                    <>
                        {sectionTypes.map((sectionType) => (
                            <SectionTypeCard key={sectionType.id} sectionType={sectionType} />
                        ))}
                    </>
                )}
            </QueryResolver>
        </div>
    );
};
