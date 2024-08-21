import { nullable } from '@taskany/bricks';
import { ModalContent, ModalHeader, ModalPreview } from '@taskany/bricks/harmony';

import { usePreviewContext } from '../../contexts/previewContext';
import { trpc } from '../../trpc/trpcClient';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import { SectionFeedback } from '../SectionFeedback/SectionFeedback';

import s from './SectionProfilePreview.module.css';

interface SectionProps {
    sectionId: number;
}

export const SectionProfilePreview = ({ sectionId }: SectionProps): JSX.Element => {
    const session = useSession();

    const { hidePreview } = usePreviewContext();
    const sectionQuery = trpc.sections.getById.useQuery({ sectionId });
    console.log('sectionQuery', sectionId);

    return (
        <>
            {nullable(sectionQuery.data, (section) => {
                <ModalPreview visible onClose={hidePreview}>
                    <ModalHeader className={s.ModalHeader}>{section.feedback}</ModalHeader>
                    <ModalContent>
                        <SectionFeedback
                            section={section}
                            isEditable={session ? accessChecks.section.update(session, section).allowed : false}
                            candidateId={section.interview.candidateId}
                            hasTasks={section.sectionType.hasTasks}
                        />
                    </ModalContent>
                </ModalPreview>;
            })}
            ;
        </>
    );
};
