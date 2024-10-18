import { FC, useMemo, useState } from 'react';
import { IconUpSmallSolid, IconDownSmallSolid } from '@taskany/icons';
import { useRouter } from 'next/router';
import { Button } from '@taskany/bricks/harmony';

import { useSession } from '../../contexts/appSettingsContext';
import { Paths } from '../../utils/paths';
import { Select } from '../Select';
import { accessChecks } from '../../modules/accessChecks';
import { HireStreamFormPopup } from '../HireStreamFormPopup/HireStreamFormPopup';

import s from './PageNavigationActionButton.module.css';
import { tr } from './PageNavigationActionButton.i18n';

export const PageNavigationActionButton: FC = () => {
    const session = useSession();
    const router = useRouter();

    const [newHireStreamVisible, setNewHireStreamVisible] = useState(false);

    const menuItems = useMemo(() => {
        const items: { id: string; text: string; action: VoidFunction }[] = [
            { id: 'problem', text: tr('New problem'), action: () => router.push(Paths.PROBLEMS_NEW) },
        ];

        const canCreateCandidates = session && accessChecks.candidate.create(session).allowed;

        if (canCreateCandidates) {
            items.push({ id: 'candidate', text: tr('New candidate'), action: () => router.push(Paths.CANDIDATES_NEW) });
        }

        const canCreateHireStreams = session && accessChecks.hireStream.create(session).allowed;

        if (canCreateHireStreams) {
            items.push({ id: 'hireStream', text: tr('New hire stream'), action: () => setNewHireStreamVisible(true) });
        }

        return items;
    }, [session, router]);

    return (
        <>
            <div className={s.NavigationSidebarActionButton}>
                <Button
                    className={s.NavigationSidebarActionButtonDefault}
                    text={tr('Create')}
                    brick="right"
                    onClick={() => router.push(Paths.PROBLEMS_NEW)}
                />
                <Select
                    items={menuItems}
                    onChange={(id) => menuItems.find((item) => item.id === id)?.action()}
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

            <HireStreamFormPopup
                visible={newHireStreamVisible}
                onClose={() => setNewHireStreamVisible(false)}
                afterSubmit={() => setNewHireStreamVisible(false)}
            />
        </>
    );
};
