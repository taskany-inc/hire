import styled from 'styled-components';

import { accessChecks } from '../../backend/access/access-checks';
import { HireStreamAnalyticsList } from '../../components/analytics/HireStreamAnalyticsList';
import { Card } from '../../components/card/Card';
import { CardHeader } from '../../components/card/CardHeader';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { QueryResolver } from '../../components/QueryResolver';
import { useHireStreams } from '../../hooks/hire-streams-hooks';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import { Paths } from '../../utils/paths';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.hireStreams.getAll.fetch();

        await handleAccessChecks(() => accessChecks.analytics.read(session));
    },
});

const StyledCard = styled(Card)`
    width: max-content;
    margin-bottom: 6px;
`;

export default () => {
    const hireStreamsQuery = useHireStreams();

    return (
        <LayoutMain pageTitle="Analytics">
            <StyledCard>
                <CardHeader title="General charts" link={Paths.ANALYTICS_COMMON} />
            </StyledCard>

            <QueryResolver queries={[hireStreamsQuery]}>
                {([hireStreams]) => <HireStreamAnalyticsList hireStreams={hireStreams} />}
            </QueryResolver>
        </LayoutMain>
    );
};
