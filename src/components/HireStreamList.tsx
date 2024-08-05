import { HireStream } from '@prisma/client';

import { pageHrefs } from '../utils/paths';
import { useSession } from '../contexts/appSettingsContext';

import { Card } from './Card/Card';
import { CardHeader } from './CardHeader';
import { Stack } from './Stack';

interface HireStreamsListProps {
    hireStreams: HireStream[];
}

export const HireStreamList = ({ hireStreams }: HireStreamsListProps) => {
    const session = useSession();

    if (!session) {
        return null;
    }

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
