import { FC } from 'react';
import { IconUpSmallSolid, IconDownSmallSolid } from '@taskany/icons';
import { useRouter } from 'next/router';
import { Button } from '@taskany/bricks/harmony';

import { Paths } from '../../utils/paths';
import { useSidebarMenu } from '../../hooks/useSidebarMenu';
import { Select } from '../Select';

import s from './PageNavigationActionButton.module.css';
import { tr } from './PageNavigationActionButton.i18n';

export const PageNavigationActionButton: FC = () => {
    const router = useRouter();
    const { entityCreationMenuItems } = useSidebarMenu();
    const onMenuItemClick = (id: string) => router.push(id);

    return (
        <div className={s.NavigationSidebarActionButton}>
            <Button
                className={s.NavigationSidebarActionButtonDefault}
                text={tr('Create')}
                brick="right"
                onClick={() => router.push(Paths.PROBLEMS_NEW)}
            />
            <Select
                items={entityCreationMenuItems.map(({ path, text }) => ({ id: path, text }))}
                onChange={onMenuItemClick}
                renderTrigger={({ isOpen, ref, onClick }) => (
                    <Button
                        brick="left"
                        iconRight={isOpen ? <IconUpSmallSolid size="s" /> : <IconDownSmallSolid size="s" />}
                        ref={ref}
                        onClick={onClick}
                    />
                )}
                placement="bottom-end"
            />
        </div>
    );
};
