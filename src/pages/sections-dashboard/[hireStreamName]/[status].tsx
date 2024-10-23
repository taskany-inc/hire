import { accessChecks } from '../../../modules/accessChecks';
import { QueryResolver } from '../../../components/QueryResolver/QueryResolver';
import { useHireStream } from '../../../modules/hireStreamsHooks';
import { InferServerSideProps } from '../../../utils/types';
import { createGetServerSideProps } from '../../../utils/createGetSSRProps';
import { filtersSsrInit } from '../../../utils/filters';
import { SectionsDashboardPage } from '../../../components/SectionsDashboardPage/SectionsDashboardPage';
import { parseInterviewStatus } from '../../../modules/candidateTypes';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    stringIds: { hireStreamName: true, status: true },
    action: async ({ session, ssg, stringIds, handleAccessChecks, context }) => {
        const hireStream = await ssg.hireStreams.getByName.fetch({ hireStreamName: stringIds.hireStreamName });
        await ssg.sectionTypes.getByHireStreamId.fetch({ hireStreamId: hireStream.id });

        const filters = await filtersSsrInit('Candidate', context, ssg);

        await handleAccessChecks(() => accessChecks.hireStream.update(session, hireStream.id));

        try {
            const status = parseInterviewStatus(stringIds.status);

            return {
                filters: {
                    ...filters,
                    hireStreamId: hireStream.id,
                },
                status,
            };
        } catch {
            return {
                redirect: { destination: '/' },
            };
        }
    },
});

const HireStreamPage = ({ stringIds, status }: InferServerSideProps<typeof getServerSideProps>) => {
    const hireStreamQuery = useHireStream(stringIds.hireStreamName);

    if (!status) {
        return null;
    }

    return (
        <QueryResolver queries={[hireStreamQuery]}>
            {([hireStream]) => (
                <SectionsDashboardPage
                    hireStreamId={hireStream.id}
                    hireStreamName={hireStream.displayName || hireStream.name}
                    status={status}
                />
            )}
        </QueryResolver>
    );
};

export default HireStreamPage;
