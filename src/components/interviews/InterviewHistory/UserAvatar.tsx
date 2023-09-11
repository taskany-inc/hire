import { FC } from 'react';
import { User } from '@prisma/client';
import { UserPic } from '@taskany/bricks';

import { ExternalUserLink } from '../../ExternalUserLink';

export const UserAvatar: FC<{ user: User }> = ({ user }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserPic name={user.name} email={user.email} />

            <ExternalUserLink style={{ marginLeft: '8px' }} user={user} />
        </div>
    );
};
