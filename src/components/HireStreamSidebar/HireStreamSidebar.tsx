import { useState } from 'react';
import { useRouter } from 'next/router';
import { HireStream } from '@prisma/client';
import { nullable } from '@taskany/bricks';
import { Badge } from '@taskany/bricks/harmony';
import { IconEdit1Outline } from '@taskany/icons';

import { Link } from '../Link';
import { HireStreamFormPopup } from '../HireStreamFormPopup/HireStreamFormPopup';
import { accessChecks } from '../../modules/accessChecks';
import { useSession } from '../../contexts/appSettingsContext';
import { SidebarBlock } from '../SidebarBlock/SidebarBlock';
import { pageHrefs } from '../../utils/paths';

import { tr } from './HireStreamSidebar.i18n';
import s from './HireStreamSidebar.module.css';

interface HireStreamSidebarProps {
    hireStream: HireStream;
}

export const HireStreamSidebar = ({ hireStream }: HireStreamSidebarProps) => {
    const [showEditPopup, setShowEditPopup] = useState(false);
    const session = useSession();
    const router = useRouter();

    const canEdit = session && accessChecks.hireStream.update(session, hireStream.id);

    return (
        <>
            <div className={s.HireStreamSidebar}>
                {nullable(hireStream.weekLimit, (l) => (
                    <SidebarBlock title={tr('Weekly limit')}>{l}</SidebarBlock>
                ))}

                {nullable(hireStream.dayLimit, (l) => (
                    <SidebarBlock title={tr('Daily limit')}>{l}</SidebarBlock>
                ))}

                <div className={s.HireStreamSidebarActions}>
                    <Link onClick={() => setShowEditPopup(true)}>
                        <Badge text={tr('Edit')} iconLeft={<IconEdit1Outline size="s" />} />
                    </Link>
                </div>
            </div>

            {nullable(canEdit, () => (
                <HireStreamFormPopup
                    visible={showEditPopup}
                    onClose={() => setShowEditPopup(false)}
                    afterSubmit={(result) => {
                        router.replace(pageHrefs.hireStream(result.name));
                        setShowEditPopup(false);
                    }}
                    hireStream={hireStream}
                />
            ))}
        </>
    );
};
