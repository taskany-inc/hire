import { HireStream } from '@prisma/client';

import { pageHrefs } from '../../utils/paths';
import { Card } from '../card/Card';
import { CardHeader } from '../card/CardHeader';
import { Stack } from '../layout/Stack';

type HireStreamsListProps = {
    hireStreams: HireStream[];
};

export const HireStreamList = ({ hireStreams }: HireStreamsListProps) => {
    return (
        <Stack direction="column" gap={6} justifyContent="flex-start">
            {hireStreams.map((hireStream) => {
                const link = pageHrefs.hireStream(hireStream.id);

                return (
                    <Card key={hireStream.id}>
                        <CardHeader title={hireStream.name} subTitle={`#${hireStream.id}`} link={link} />
                    </Card>
                );
            })}
        </Stack>
    );
};
