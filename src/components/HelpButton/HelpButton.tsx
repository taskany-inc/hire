import React, { ComponentProps } from 'react';
import { Link } from '@taskany/bricks/harmony';
import { IconQuestionCircleSolid } from '@taskany/icons';

import s from './HelpButton.module.css';

interface HelpButtonProps {
    size?: ComponentProps<typeof IconQuestionCircleSolid>['size'];
}

export const HelpButton = React.memo(({ size = 20 }: HelpButtonProps) => (
    <Link className={s.Circle}>
        <IconQuestionCircleSolid size={size} className={s.Icon} />
    </Link>
));
