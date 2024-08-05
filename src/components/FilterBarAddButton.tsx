import React, { VFC } from 'react';
import { Button } from '@taskany/bricks/harmony';

import { Link } from './Link';

interface FilterBarAddButtonProps {
    link: string;
    text: string;
    className?: string;
}

export const FilterBarAddButton: VFC<FilterBarAddButtonProps> = ({ link, text, className }) => {
    return (
        <Link href={link} className={className}>
            <Button view="primary" text={text} type="button" />
        </Link>
    );
};
