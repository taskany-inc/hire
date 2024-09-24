import { FC } from 'react';
import { nullable } from '@taskany/bricks';

import { trpc } from '../../trpc/trpcClient';
import { Section } from '../Section/Section';
import { generatePath, Paths } from '../../utils/paths';
import { SectionHeaderPreview } from '../SectionHeaderPreview/SectionHeaderPreview';
import { Preview } from '../Preview/Preview';

interface SectionProps {
    sectionId: number;
}

export const SectionPreview: FC<SectionProps> = ({ sectionId }: SectionProps) => {
    const sectionQuery = trpc.sections.getById.useQuery({ sectionId });

    return nullable(sectionQuery.data, (section) => {
        return (
            <Preview
                header={
                    <SectionHeaderPreview
                        pageTitle={section.sectionType.title}
                        href={generatePath(Paths.SECTION, {
                            interviewId: section.interview.id,
                            sectionId: section.id,
                        })}
                        section={section}
                        date={section.updatedAt}
                        readOnly={true}
                    />
                }
                content={<Section showAddProblemButton={false} section={section} />}
            />
        );
    });
};
