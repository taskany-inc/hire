import { ComponentProps, FC } from 'react';
import { UserPic } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';

import { ExternalUserLink } from './ExternalUserLink';

export const UserAvatar: FC<{ user: ComponentProps<typeof ExternalUserLink>['user'] }> = ({ user }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserPic name={user.name} email={user.email} />

            <Text size="m" as="span" style={{ marginLeft: '8px' }}>
                <ExternalUserLink user={user} />
            </Text>
        </div>
    );
};
