import { FC } from 'react';
import { IconUpSmallSolid, IconDownSmallSolid } from '@taskany/icons';
import { useRouter } from 'next/router';
import { Button, Text, Select, SelectPanel, SelectTrigger } from '@taskany/bricks/harmony';
import { UserSettings } from '@prisma/client';

import { Paths } from '../../utils/paths';
import { useHeaderMenu } from '../../hooks/useHeaderMenu';

import s from './PageNavigationActionButton.module.css';
import { tr } from './PageNavigationActionButton.i18n';

interface PageNavigationActionButtonProps {
    userSettings?: UserSettings;
}

export const PageNavigationActionButton: FC<PageNavigationActionButtonProps> = ({ userSettings }) => {
    const router = useRouter();
    const { entityCreationMenuItems } = useHeaderMenu(userSettings);
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
                renderItem={({ item }) => (
                    <Text size="s" onClick={() => onMenuItemClick(item)}>
                        {item.title}
                    </Text>
                )}
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
