import { ComponentProps, FC, useMemo } from 'react';
import { KanbanScroller } from '@taskany/bricks/harmony';

import { interviewStatusLabels } from '../../utils/dictionaries';
import { pageHrefs } from '../../utils/paths';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { SectionsDashboardFilterBar } from '../SectionsDashboardFilterBar/SectionsDashboardFilterBar';
import { SectionsKanban } from '../CandidatesKanban/CandidatesKanban';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs';

import { tr } from './SectionsDashboardPage.i18n';
import s from './SectionsDashboardPage.module.css';

interface SectionsDashboardPageProps {
    hireStreamId: number;
    hireStreamName: string;
    status: ComponentProps<typeof SectionsKanban>['status'];
}

export const SectionsDashboardPage: FC<SectionsDashboardPageProps> = ({ hireStreamId, hireStreamName, status }) => {
    const breadcrums = useMemo(
        () => [
            {
                title: hireStreamName,
                href: pageHrefs.hireStream(hireStreamName),
            },
            {
                title: interviewStatusLabels[status],
            },
        ],
        [hireStreamName, status],
    );

    return (
        <LayoutMain pageTitle={tr('Dashboard')} filterBar={<SectionsDashboardFilterBar title={tr('Dashboard')} />}>
            <KanbanScroller shadow={30}>
                <Breadcrumbs className={s.Breadcrumbs} items={breadcrums} />
                <SectionsKanban hireStreamId={hireStreamId} status={status} />
            </KanbanScroller>
        </LayoutMain>
    );
};
