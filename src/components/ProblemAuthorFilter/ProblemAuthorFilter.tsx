import React from 'react';
import { User } from '@prisma/client';

import { useSession } from '../../contexts/appSettingsContext';
import { FiltersMenuItem } from '../FiltersMenuItem';

import { tr } from './ProblemAuthorFilter.i18n';

interface ProblemAuthorFilterProps {
    author?: User | null;

    onChange: (selected: User | null) => void;
}

export const ProblemAuthorFilter = React.forwardRef<HTMLDivElement, ProblemAuthorFilterProps>(
    ({ author, onChange }, ref) => {
        const session = useSession();
        const isCanShowMyProblems = author ? author.id !== session?.user.id : true;
        const handleClickMy = () => isCanShowMyProblems && onChange(session?.user ?? null);

        return (
            <>
                <FiltersMenuItem ref={ref} active={!isCanShowMyProblems} onClick={handleClickMy}>
                    {tr('My')}
                </FiltersMenuItem>
                {author?.name && (
                    <FiltersMenuItem onClick={() => onChange(null)} active>
                        {author.name}
                    </FiltersMenuItem>
                )}
            </>
        );
    },
);
