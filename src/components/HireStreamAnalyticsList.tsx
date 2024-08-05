import { HireStream } from '@prisma/client';

import { pageHrefs } from '../utils/paths';

import { Card } from './Card/Card';
import { CardHeader } from './CardHeader/CardHeader';
import { Stack } from './Stack';

interface HireStreamAnalyticsListProps {
    hireStreams: HireStream[];
}

export const HireStreamAnalyticsList = ({ hireStreams }: HireStreamAnalyticsListProps) => {
    return (
        <Stack direction="column" gap={6} justifyContent="flex-start">
            {hireStreams.map((hireStream) => (
                <Card key={hireStream.id}>
                    <CardHeader
                        title={hireStream.name}
                        subTitle={`#${hireStream.id}`}
                        link={pageHrefs.analyticsHireStream(hireStream.name)}
                    />
                </Card>
            ))}
        </Stack>
    );
};
