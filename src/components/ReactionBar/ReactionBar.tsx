import { CSSProperties, useRef, useState } from 'react';
import { User } from '@prisma/client';
import dynamic from 'next/dynamic';
import { Text } from '@taskany/bricks';

import { useSession } from '../../contexts/app-settings-context';
import { Stack } from '../layout/Stack';
import { useUpsertReactionMutation } from '../../hooks/reaction-hooks';
import { UpsertReaction } from '../../backend/modules/reaction/reaction-types';

import { Reaction } from './Reaction';
import { ReactionType } from './types';
import { updateAuthors, updateCount } from './helpers';

const Popup = dynamic(() => import('@taskany/bricks/components/Popup'));

type ReactionBarProps = {
    reactions: ReactionType[];
    interviewId: number;
    className?: string;
    style?: CSSProperties;
};

export const ReactionBar = ({ reactions, interviewId, className, style }: ReactionBarProps): JSX.Element => {
    const session = useSession();

    const [currentReactions, setCurrentReactions] = useState<ReactionType[]>(reactions);

    const [popupVisible, setPopupVisibility] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    const upsertReactionMutation = useUpsertReactionMutation();

    const currentUser = {
        id: Number(session?.user.id),
        ...session?.user,
    };

    const onChangeReaction = (updatedReaction: ReactionType) => {
        const updateReaction: UpsertReaction = {
            name: updatedReaction.isSelect ? updatedReaction.name : null,
            userId: currentUser.id,
            interviewId,
        };

        upsertReactionMutation.mutateAsync(updateReaction);

        const newCurrentReactions = currentReactions.map((currentReaction) => {
            const isUpdatedReaction = updatedReaction.name === currentReaction.name;

            return {
                ...currentReaction,
                count: updateCount(isUpdatedReaction, currentReaction, updatedReaction),
                isSelect: isUpdatedReaction ? updatedReaction.isSelect : false,
                authors: updateAuthors({
                    isUpdatedReaction,
                    updatedReaction,
                    currentReaction,
                    currentUser: currentUser as User,
                }),
            };
        });

        setCurrentReactions(newCurrentReactions);
    };

    const tooltipTitle = (authors: User[]) =>
        authors.length > 0 && authors.map(({ name, id }) => <Text key={id}>{name}</Text>);

    const renderReaction = (reaction: ReactionType) => {
        if (reaction.authors.length > 0) {
            return (
                <>
                    <div
                        ref={popupRef}
                        onMouseEnter={() => setPopupVisibility(true)}
                        onMouseLeave={() => setPopupVisibility(false)}
                    >
                        <Reaction reaction={reaction} onClick={onChangeReaction} />
                    </div>
                    <Popup tooltip arrow={false} placement="bottom-start" reference={popupRef} visible={popupVisible}>
                        <Text size="s">{tooltipTitle(reaction.authors)}</Text>
                    </Popup>
                </>
            );
        }

        return <Reaction key={reaction.id} reaction={reaction} onClick={onChangeReaction} />;
    };

    return (
        <Stack direction="row" gap={12} justifyContent="start" className={className} style={style}>
            {currentReactions.map(renderReaction)}
        </Stack>
    );
};
