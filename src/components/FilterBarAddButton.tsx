import React, { VFC } from 'react';
import { Button } from '@taskany/bricks';

import { Link } from './Link';

type FilterBarAddButtonProps = {
    link: string;
    text: string;
};

export const FilterBarAddButton: VFC<FilterBarAddButtonProps> = ({ link, text }) => {
    return (
        <Link href={link}>
            <Button outline view="primary" text={text} type="button" />
        </Link>
    );
};
