import { nullable, Text } from '@taskany/bricks';
import { gray8 } from '@taskany/colors';

import s from './CardHeaderComment.module.css';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    timeAgo: string;
}

export const CardHeaderComment: React.FC<CardHeaderProps> = ({ name, timeAgo }) => {
    return (
        <div className={s.CardHeaderComment}>
            {nullable(name, (n) => (
                <>
                    <Text size="xs" color={gray8} weight="bold">
                        {n}
                    </Text>
                    <Text size="xs" color={gray8}>
                        {timeAgo}
                    </Text>
                </>
            ))}
        </div>
    );
};
