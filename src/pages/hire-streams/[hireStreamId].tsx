import { accessChecks } from '../../backend/access/access-checks';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { QueryResolver } from '../../components/QueryResolver';
import { SectionTypeManagement } from '../../components/section-types/SectionTypeManagement';
import { useHireStream } from '../../hooks/hire-streams-hooks';
import { InferServerSideProps } from '../../types';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { hireStreamId: true },
    action: async ({ session, ssg, numberIds, handleAccessChecks }) => {
        const hireStream = await ssg.hireStreams.getById.fetch({ hireStreamId: numberIds.hireStreamId });

        await handleAccessChecks(() => accessChecks.hireStream.update(session, hireStream.id));
    },
});

const HireStreamPage = ({ numberIds }: InferServerSideProps<typeof getServerSideProps>) => {
    const hireStreamQuery = useHireStream(numberIds.hireStreamId);

    return (
        <QueryResolver queries={[hireStreamQuery]}>
            {([hireStream]) => (
                <LayoutMain pageTitle={hireStream.name}>
                    <SectionTypeManagement hireStream={hireStream} />
                </LayoutMain>
            )}
        </QueryResolver>
    );
};

export default HireStreamPage;
