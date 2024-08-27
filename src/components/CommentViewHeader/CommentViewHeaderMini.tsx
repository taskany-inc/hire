import { ComponentProps, FC, ReactNode } from 'react';
import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';

import { ExternalUserLink } from '../ExternalUserLink';

import { CommentViewHeaderContainer } from './CommentViewHeaderContainer';
import { CommentViewHeaderMetaInfo } from './CommentViewHeaderMetaInfo';
import { CommentViewHeaderDot } from './CommentViewHeaderDot';

interface CommentViewHeaderMiniProps {
    children?: ReactNode;
    author: ComponentProps<typeof ExternalUserLink>['user'];
    dot?: boolean;
}

export const CommentViewHeaderMini: FC<CommentViewHeaderMiniProps> = ({ author, dot, children }) => {
    return (
        <CommentViewHeaderContainer>
            <CommentViewHeaderMetaInfo>
                <Text size="s" weight="bold">
                    <ExternalUserLink user={author} />
                </Text>

                {nullable(dot, () => (
                    <CommentViewHeaderDot />
                ))}

                {children}
            </CommentViewHeaderMetaInfo>
        </CommentViewHeaderContainer>
    );
};
