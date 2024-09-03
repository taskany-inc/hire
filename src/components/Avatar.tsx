import { ComponentProps, FC, useRef } from 'react';
import { Tooltip, User } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

interface AvatarProps extends ComponentProps<typeof User> {
    tooltip?: string | null;
}

export const Avatar: FC<AvatarProps> = ({ tooltip, ...props }) => {
    const badgeRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <User ref={badgeRef} {...props} />
            {nullable(tooltip, (t) => (
                <Tooltip arrow reference={badgeRef} placement="top">
                    {t}
                </Tooltip>
            ))}
        </>
    );
};
