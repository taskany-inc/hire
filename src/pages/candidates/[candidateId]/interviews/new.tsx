import { ErrorWithStatus } from '../../../../utils';
import { createGetServerSideProps } from '../../../../utils/createGetSSRProps';
import SectionCreationPage from '../../../../components/SectionCreationPage/SectionCreationPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { candidateId: true },
    action: async ({ ssg, session, numberIds }) => {
        await ssg.hireStreams.getAllowed.fetch();
        await ssg.candidates.getById.fetch({ candidateId: numberIds.candidateId });

        if (!(session.userRoles.admin || session.userRoles.hasHiringLeadRoles || session.userRoles.hasRecruiterRoles)) {
            throw new ErrorWithStatus('No access to interview', 403);
        }
    },
});

export default SectionCreationPage;
