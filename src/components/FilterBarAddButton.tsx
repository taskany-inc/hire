import React, { VFC } from 'react';
import { Button, Link } from '@taskany/bricks';

type FilterBarAddButtonProps = {
    link: string;
    text: string;
};

export const FilterBarAddButton: VFC<FilterBarAddButtonProps> = ({ link, text }) => {
    return (
        <Link inline href={link}>
            <Button view="primary" text={text} type="button" />
        </Link>
    );
};
