import { ComponentProps, FC } from 'react';
import { Text } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { interviewStatusLabels } from '../../utils/dictionaries';
import { CommentView } from '../CommentView/CommentView';
import { CommentViewHeaderMini } from '../CommentViewHeader/CommentViewHeaderMini';

import { tr } from './CandidateKanbanCard.i18n';

export const CandidateKanbanCardComment: FC<ComponentProps<typeof CommentView>> = (props) => (
    <CommentView
        avatarSize="s"
        placeholder={tr('No provided feedback')}
        header={
            <CommentViewHeaderMini dot author={props.author}>
                {nullable(props.status, (s) => (
                    <Text weight="bold">{interviewStatusLabels[s]}</Text>
                ))}
            </CommentViewHeaderMini>
        }
        {...props}
    />
);
