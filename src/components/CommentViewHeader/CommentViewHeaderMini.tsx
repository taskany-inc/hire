import { FC, ReactNode } from 'react';
import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';

import { Author, getAuthorLink } from '../../utils/user';
import { Link } from '../Link';
import { CommentStatus } from '../CommentView/CommentView';

import { CommentViewHeaderContainer } from './CommentViewHeaderContainer';
import { CommentViewHeaderMetaInfo } from './CommentViewHeaderMetaInfo';
import { CommentViewHeaderDot } from './CommentViewHeaderDot';

interface CommentViewHeaderMiniProps {
    children?: ReactNode;
    author: Author;
    status?: CommentStatus;
    dot?: boolean;
}

export const CommentViewHeaderMini: FC<CommentViewHeaderMiniProps> = ({ author, dot, children }) => {
    const authorLink = getAuthorLink(author);
    const authorName = author.name ?? author.email;

    return (
        <CommentViewHeaderContainer>
            <CommentViewHeaderMetaInfo>
                <Text size="s" weight="bold">
                    {nullable(
                        authorLink,
                        (link) => (
                            <Link href={link} inline target="_blank">
                                {authorName}
                            </Link>
                        ),
                        authorName,
                    )}
                </Text>

                {nullable(dot, () => (
                    <CommentViewHeaderDot />
                ))}

                {children}
            </CommentViewHeaderMetaInfo>
        </CommentViewHeaderContainer>
    );
};
