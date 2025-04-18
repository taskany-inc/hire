import { FC, ReactNode } from 'react';
import NextLink from 'next/link';
import { Text, TreeView, TreeViewNode, TreeViewElement, TreeViewTitle, Link } from '@taskany/bricks/harmony';

import { pageHrefs } from '../../utils/paths';

import s from './HireStreamCollapsableItem.module.css';

export const HireStreamCollapsableItem: FC<{
    name: string;
    displayName?: string | null;
    children?: ReactNode;
    visible?: boolean;
    disable?: boolean;
}> = ({ name, displayName, children, visible, disable }) => {
    return (
        <TreeView className={s.HireStreamCollapsableItem}>
            <TreeViewNode
                visible={visible}
                interactive={!disable}
                title={
                    <TreeViewTitle className={s.HireStreamCollapsableItemHeader}>
                        <NextLink href={pageHrefs.hireStream(name)} passHref legacyBehavior>
                            <Link className={s.HireStreamCollapsableItemLink}>
                                <Text weight="semiBold" size="l" className={s.HireStreamCollapsableItemTitle}>
                                    {displayName || name}
                                </Text>
                            </Link>
                        </NextLink>
                    </TreeViewTitle>
                }
            >
                <TreeViewElement>{children}</TreeViewElement>
            </TreeViewNode>
        </TreeView>
    );
};
