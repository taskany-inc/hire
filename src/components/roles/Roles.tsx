import { useState } from 'react';
import { HireStream } from '@prisma/client';
import { Text, Button } from '@taskany/bricks';
import styled from 'styled-components';

import { useHireStreams } from '../../hooks/hire-streams-hooks';
import { accessChecks } from '../../backend/access/access-checks';
import { useSession } from '../../contexts/app-settings-context';
import { Stack } from '../layout/Stack';
import { QueryResolver } from '../QueryResolver';

import { HireStreamUsers } from './HireStreamUsers';
import { AdminsList } from './AdminList';
import { tr } from './roles.i18n';

const StyledButton = styled(Button)`
    margin: 0 8px 8px 0;
`;

export const Roles = () => {
    const session = useSession();

    const hireStreamsQuery = useHireStreams();

    const [currentHireStream, setCurrentHireStream] = useState<HireStream>();

    if (!session) {
        return null;
    }

    const canReadAdmins = accessChecks.roles.readAdmins(session).allowed;

    return (
        <Stack direction="column" justifyItems="flex-start" gap={24}>
            {canReadAdmins && <AdminsList />}

            <Text size="xl">{tr('Hire streams')}</Text>

            <QueryResolver queries={[hireStreamsQuery]}>
                {([hireStreams]) => {
                    return (
                        <div>
                            {hireStreams.map((hireStream) => {
                                const canReadHireStream = accessChecks.roles.readOrUpdateHireStreamUsers(
                                    session,
                                    hireStream.id,
                                ).allowed;

                                return (
                                    <StyledButton
                                        view={currentHireStream?.id === hireStream.id ? 'primary' : 'default'}
                                        onClick={() => setCurrentHireStream(hireStream)}
                                        disabled={!canReadHireStream}
                                        key={hireStream.id}
                                        text={hireStream.name}
                                    />
                                );
                            })}
                        </div>
                    );
                }}
            </QueryResolver>

            {currentHireStream && <HireStreamUsers hireStream={currentHireStream} />}
        </Stack>
    );
};
