import { FC, ReactNode } from 'react';
import { Text } from '@taskany/bricks/harmony';

import { Link } from '../Link';

import s from './PageTitle.module.css';

interface PageTitleProps {
    title: string;
    gutter?: string;
    backlink?: string;
    children?: ReactNode;
}

export const PageTitle: FC<PageTitleProps> = ({ title, backlink, children }) => {
    return (
        <div>
            <Text className={s.PageTitleWrapperText} size="xl" weight="bolder">
                {backlink ? <Link href={backlink}>{title}</Link> : title}
            </Text>
            {children}
        </div>
    );
};
