import { ComponentProps, FC, useRef } from 'react';
import { Tooltip } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { UserBadge } from '../UserBadge/UserBadge';

import s from './Avatar.module.css';

interface AvatarProps extends ComponentProps<typeof UserBadge> {
    tooltip?: string | null;
}

export const Avatar: FC<AvatarProps> = ({ tooltip, ...props }) => {
    const badgeRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <UserBadge ref={badgeRef} className={s.Avatar} as="span" {...props} />
            {nullable(tooltip, (t) => (
                <Tooltip arrow reference={badgeRef} placement="top">
                    {t}
                </Tooltip>
            ))}
        </>
    );
};
