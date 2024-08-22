import { FC } from 'react';
import { IconUpSmallSolid, IconDownSmallSolid } from '@taskany/icons';
import { useRouter } from 'next/router';
import { Button, Text, Select, SelectPanel, SelectTrigger } from '@taskany/bricks/harmony';

import { Paths } from '../../utils/paths';
import { useSidebarMenu } from '../../hooks/useHeaderMenu';

import s from './PageNavigationActionButton.module.css';
import { tr } from './PageNavigationActionButton.i18n';

export const PageNavigationActionButton: FC = () => {
    const router = useRouter();
    const { entityCreationMenuItems } = useSidebarMenu();
    const onMenuItemClick = (param: { id: string }[]) => router.push(param[0].id);

    return (
        <div className={s.NavigationSidebarActionButton}>
            <Button
                className={s.NavigationSidebarActionButtonDefault}
                text={tr('Create')}
                brick="right"
                onClick={() => router.push(Paths.PROBLEMS_NEW)}
            />
            <Select
                items={entityCreationMenuItems.map(({ path, text }) => ({ id: path, title: text }))}
                onChange={onMenuItemClick}
                renderItem={({ item }) => <Text size="s">{item.title}</Text>}
            >
                <SelectTrigger
                    renderTrigger={({ isOpen, ref, onClick }) => (
                        <Button
                            brick="left"
                            iconRight={isOpen ? <IconUpSmallSolid size="s" /> : <IconDownSmallSolid size="s" />}
                            ref={ref}
                            onClick={onClick}
                        />
                    )}
                />
                <SelectPanel placement="bottom-end" />
            </Select>
        </div>
    );
};
