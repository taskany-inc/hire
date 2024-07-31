import React, { VFC } from 'react';
import { Button } from '@taskany/bricks/harmony';

import { Link } from './Link';

interface FilterBarAddButtonProps {
    link: string;
    text: string;
}

export const FilterBarAddButton: VFC<FilterBarAddButtonProps> = ({ link, text }) => {
    return (
        <Link href={link}>
            <Button view="primary" text={text} type="button" />
        </Link>
    );
};
