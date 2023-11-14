import { ReactNode } from 'react';

import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { CardContent } from './CardContent';
import { MarkdownRenderer } from './MarkdownRenderer/MarkdownRenderer';

interface Props {
    title: string;
    subtitle?: ReactNode;
    link?: string;
    chips?: ReactNode;
    markdown?: string;
}

export const ListItem = ({ title, subtitle, link, chips, markdown }: Props) => {
    return (
        <Card>
            <CardHeader title={title} subTitle={subtitle} link={link} chips={chips} />
            <CardContent>
                <MarkdownRenderer value={markdown ?? ''} />
            </CardContent>
        </Card>
    );
};
