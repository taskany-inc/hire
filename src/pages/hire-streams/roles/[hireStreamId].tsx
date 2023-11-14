import { accessChecks } from '../../../modules/accessChecks';
import { QueryResolver } from '../../../components/QueryResolver/QueryResolver';
import { HireStreamUsers } from '../../../components/HireStreamUsers/HireStreamUsers';
import { HireStreamLayout } from '../../../components/HireStreamLayout/HireStreamLayout';
import { useHireStream } from '../../../modules/hireStreamsHooks';
import { InferServerSideProps } from '../../../utils/types';
import { createGetServerSideProps } from '../../../utils/createGetSSRProps';

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
