import React from 'react';
import { useRouter } from 'next/router';
import { Switch, SwitchControl } from '@taskany/bricks/harmony';
import { HireStream } from '@prisma/client';

import { Paths, pageHrefs } from '../../utils/paths';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { Link } from '../Link';
import { HireStreamSidebar } from '../HireStreamSidebar/HireStreamSidebar';

import { tr } from './HireStreamLayout.i18n';
import s from './HireStreamLayout.module.css';

interface HireStreamLayoutProps {
    children: React.ReactNode;
    hireStream: HireStream;
}

export const HireStreamLayout: React.FC<HireStreamLayoutProps> = ({ children, hireStream }) => {
    const router = useRouter();

    const switchOptions: Array<[string, string]> = [
        [tr('Section types'), pageHrefs.hireStream(hireStream.name)],
        [tr('Roles'), pageHrefs.hireStreamRoles(hireStream.name)],
    ];

    return (
        <LayoutMain pageTitle={hireStream.displayName || hireStream.name} backlink={Paths.HIRE_STREAMS}>
            <div className={s.HireStreamLayoutColumns}>
                <div>
                    <Switch value={router.asPath} className={s.HireStreamLayoutSwitch}>
                        {switchOptions.map(([title, href]) => (
                            <Link key={href} href={href}>
                                <SwitchControl text={title} value={href} />
                            </Link>
                        ))}
                    </Switch>
                    {children}
                </div>
                <HireStreamSidebar hireStream={hireStream} />
            </div>
        </LayoutMain>
    );
};
