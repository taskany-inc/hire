import { ReactNode } from 'react';

import { HeaderUserMenu } from '../HeaderUserMenu/HeaderUserMenu';

import s from './PageHeader.module.css';

interface PageHeaderProps {
    children?: ReactNode;
}

export const PageHeader = ({ children }: PageHeaderProps) => {
    return (
        <div className={s.PageHeader}>
            {children}
            <HeaderUserMenu />
        </div>
    );
};
