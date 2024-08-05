import { Button } from '@taskany/bricks/harmony';

import { tr } from './LoadMoreProblemsButton.i18n';
import s from './LoadMoreProblemsButton.module.css';

export const LoadMoreProblemsButton = (props: React.ComponentProps<typeof Button>) => (
    <div className={s.LoadMoreProblemsButtonLoadContainer}>
        <Button {...props} text={tr('Load more problems...')} />
    </div>
);
