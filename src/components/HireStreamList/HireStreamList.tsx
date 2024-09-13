import { HireStream } from '@prisma/client';
import { Card, CardContent, CardInfo } from '@taskany/bricks/harmony';

import { useSession } from '../../contexts/appSettingsContext';
import { CardHeader } from '../CardHeader/CardHeader';
import { Link } from '../Link';

import s from './HireStreamList.module.css';

interface HireStreamsListProps {
    hireStreams: HireStream[];
    getLink: (hireStream: HireStream) => string;
}

export const HireStreamList = ({ hireStreams, getLink }: HireStreamsListProps) => {
    const session = useSession();

    if (!session) {
        return null;
    }

    return (
        <div className={s.HireStreamList}>
            {hireStreams.map((hireStream) => {
                const link = getLink(hireStream);
                return (
                    <Card key={hireStream.id}>
                        <CardInfo>
                            <CardHeader title={<Link href={link}>{hireStream.name}</Link>} />
                        </CardInfo>
                        <CardContent>#{hireStream.id}</CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
