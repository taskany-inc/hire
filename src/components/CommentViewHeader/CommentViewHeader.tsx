import { ComponentProps, FC, Fragment, ReactNode } from 'react';
import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';

import { useDistanceDate } from '../../hooks/useDateFormat';
import { ExternalUserLink } from '../ExternalUserLink';

import { CommentViewHeaderContainer } from './CommentViewHeaderContainer';
import { CommentViewHeaderMetaInfo } from './CommentViewHeaderMetaInfo';
import { CommentViewHeaderDot } from './CommentViewHeaderDot';
import s from './CommentViewHeader.module.css';

interface CommentViewHeaderProp {
    subtitle?: string;
    dot?: boolean;
    children?: ReactNode;
    authorRole?: string;
    authors: ComponentProps<typeof ExternalUserLink>['user'][];
    date: Date;
}

export const CommentViewHeader: FC<CommentViewHeaderProp> = ({
    children,
    authors,
    authorRole,
    date,
    subtitle,
    dot,
}) => {
    const timeAgo = useDistanceDate(date);

    return (
        <CommentViewHeaderContainer>
            {nullable(children, (ch) => (
                <div className={s.CommentViewHeaderContent}>{ch}</div>
            ))}

            <CommentViewHeaderMetaInfo>
                {nullable(subtitle, (s) => (
                    <Text size="s" weight="semiBold">
                        {s}
                    </Text>
                ))}

                {nullable(dot, () => (
                    <CommentViewHeaderDot />
                ))}

                <Text size="xs" weight="semiBold">
                    {nullable(authorRole, (role) => `${role} `)}
                    {authors.map((author, i) => (
                        <Fragment key={author.email}>
                            <ExternalUserLink user={author} />
                            {nullable(i !== authors.length - 1, () => ', ')}
                        </Fragment>
                    ))}
                </Text>
                <span>—</span>
                <Text size="xs">{timeAgo}</Text>
            </CommentViewHeaderMetaInfo>
        </CommentViewHeaderContainer>
    );
};
