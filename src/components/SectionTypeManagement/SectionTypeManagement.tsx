import { VFC } from 'react';
import { HireStream } from '@prisma/client';
import { Text } from '@taskany/bricks';

import { useSectionTypes } from '../../modules/sectionTypeHooks';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { NewSectionTypeModal } from '../SectionTypeForm/SectionTypeForm';
import { SectionTypeCard } from '../SectionTypeCard/SectionTypeCard';

import { tr } from './SectionTypeManagement.i18n';

type SectionTypeManagementProps = {
    hireStream: HireStream;
};

export const SectionTypeManagement: VFC<SectionTypeManagementProps> = ({ hireStream }) => {
    const sectionTypesQuery = useSectionTypes(hireStream.id);

    return (
        <>
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
        </>
    );
};
