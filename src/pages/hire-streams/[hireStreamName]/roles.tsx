import { accessChecks } from '../../../modules/accessChecks';
import { QueryResolver } from '../../../components/QueryResolver/QueryResolver';
import { HireStreamUsers } from '../../../components/HireStreamUsers/HireStreamUsers';
import { HireStreamLayout } from '../../../components/HireStreamLayout/HireStreamLayout';
import { useHireStream } from '../../../modules/hireStreamsHooks';
import { InferServerSideProps } from '../../../utils/types';
import { createGetServerSideProps } from '../../../utils/createGetSSRProps';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    stringIds: { hireStreamName: true },
    action: async ({ session, ssg, stringIds, handleAccessChecks }) => {
        const hireStream = await ssg.hireStreams.getByName.fetch({ hireStreamName: stringIds.hireStreamName });

        await handleAccessChecks(() => accessChecks.roles.readOrUpdateHireStreamUsers(session, hireStream.id));
    },
});

const HireStreamPage = ({ stringIds }: InferServerSideProps<typeof getServerSideProps>) => {
    const hireStreamQuery = useHireStream(stringIds.hireStreamName);

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
