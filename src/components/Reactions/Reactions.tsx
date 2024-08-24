import React from 'react';
import { Popup, nullable } from '@taskany/bricks';

import { ReactionsMap } from '../../modules/reactionTypes';
import { ReactionsButton } from '../ReactionsButton';
import ReactionsDropdown from '../ReactionDropdown/ReactionDropdown';
import { useReactionsResource } from '../../modules/reactionHooks';

import { tr } from './Reactions.i18n';
import s from './Reactions.module.css';

interface ReactionsProps {
    reactions?: ReactionsMap;

    onClick?: React.ComponentProps<typeof ReactionsButton>['onClick'];
}

export const Reactions = React.memo(({ reactions, onClick }: ReactionsProps) => {
    const { reactionsProps } = useReactionsResource(reactions);

    return (
        <div className={s.Reactions}>
            {nullable(reactions, (reactionsMap) =>
                Object.entries(reactionsMap).map(([reaction, { authors, count, remains }]) => {
                    return (
                        <Popup
                            key={reaction}
                            target={<ReactionsButton emoji={reaction} count={count} onClick={onClick} />}
                            tooltip
                            offset={[0, 8]}
                            maxWidth={300}
                            placement="top"
                        >
                            {authors.map(({ name }) => name).join(', ')}
                            {nullable(remains, (count) => tr.raw('and {count} more', { count }))}
                        </Popup>
                    );
                }),
            )}

            {nullable(!reactionsProps.limited, () => (
                <ReactionsDropdown view="button" onClick={onClick} />
            ))}
        </div>
    );
});
