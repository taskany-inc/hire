import { accessChecks } from '../../../backend/access/access-checks';
import { QueryResolver } from '../../../components/QueryResolver';
import { HireStreamUsers } from '../../../components/roles/HireStreamUsers';
import { HireStreamLayout } from '../../../controllers/HireStreamLayout';
import { useHireStream } from '../../../hooks/hire-streams-hooks';
import { InferServerSideProps } from '../../../types';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { hireStreamId: true },
    action: async ({ session, ssg, numberIds, handleAccessChecks }) => {
        const hireStream = await ssg.hireStreams.getById.fetch({ hireStreamId: numberIds.hireStreamId });

        await handleAccessChecks(() => accessChecks.roles.readOrUpdateHireStreamUsers(session, hireStream.id));
    },
});

const HireStreamPage = ({ numberIds }: InferServerSideProps<typeof getServerSideProps>) => {
    const hireStreamQuery = useHireStream(numberIds.hireStreamId);

    return (
        <QueryResolver queries={[hireStreamQuery]}>
            {([hireStream]) => (
                <HireStreamLayout hireStream={hireStream}>
                    <HireStreamUsers hireStream={hireStream} />
                </HireStreamLayout>
            )}
        </QueryResolver>
    );
};

export default HireStreamPage;
