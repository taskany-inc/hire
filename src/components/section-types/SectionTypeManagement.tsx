import { VFC } from 'react';
import { HireStream } from '@prisma/client';
import { Text } from '@taskany/bricks';

import { useSectionTypes } from '../../hooks/section-type-hooks';
import { QueryResolver } from '../QueryResolver';

import { NewSectionTypeModal } from './SectionTypeForm';
import { SectionTypeCard } from './SectionTypeCard';

type SectionTypeManagementProps = {
    hireStream: HireStream;
};

export const SectionTypeManagement: VFC<SectionTypeManagementProps> = ({ hireStream }) => {
    const sectionTypesQuery = useSectionTypes(hireStream.id);

    return (
        <>
            <Text size="xl">
                Section types <NewSectionTypeModal hireStreamId={hireStream.id} />
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
