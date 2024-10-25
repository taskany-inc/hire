import { ComponentProps, FC } from 'react';
import cn from 'classnames';
import { Breadcrumbs as BreadcrumbsBricks, Breadcrumb, Text, Counter } from '@taskany/bricks/harmony';

import { Link } from '../Link';

import s from './Breadcrumbs.module.css';

interface BreadcrumbsProps extends ComponentProps<typeof BreadcrumbsBricks> {
    items: {
        title: string;
        href?: string;
    }[];
    count?: number;
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ items, className, count, ...rest }) => {
    return (
        <div className={cn(s.Breadcrumbs, className)}>
            <BreadcrumbsBricks separator="/" {...rest}>
                {items.map((item, index) => {
                    const text = (
                        <Text
                            size="ml"
                            weight="bold"
                            className={cn({
                                [s.Breadcrumb_active]: items.length - 1 === index,
                            })}
                        >
                            {item.title}
                        </Text>
                    );

                    return (
                        <Breadcrumb key={index}>{item.href ? <Link href={item.href}>{text}</Link> : text}</Breadcrumb>
                    );
                })}
            </BreadcrumbsBricks>
            <Counter count={count ?? 0} />
        </div>
    );
};
