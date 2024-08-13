import { HireStream } from '@prisma/client';

import { pageHrefs } from '../utils/paths';

import { Card } from './Card/Card';
import { CardHeader } from './CardHeader/CardHeader';
import { Stack } from './Stack';
import { Link } from './Link';

interface HireStreamAnalyticsListProps {
    hireStreams: HireStream[];
}

export const HireStreamAnalyticsList = ({ hireStreams }: HireStreamAnalyticsListProps) => {
    return (
        <Stack direction="column" gap={6} justifyContent="flex-start">
            {hireStreams.map((hireStream) => (
                <Card key={hireStream.id}>
                    <CardHeader
                        title={<Link href={pageHrefs.analyticsHireStream(hireStream.name)}>{hireStream.name}</Link>}
                        subTitle={`#${hireStream.id}`}
                    />
                </Card>
            ))}
        </Stack>
    );
};
