import { Button } from '@taskany/bricks/harmony';
import { IconStarOutline, IconStarSolid } from '@taskany/icons';

import { useAddProblemToFavoritesMutation, useRemoveProblemFromFavoritesMutation } from '../../modules/userHooks';

interface ProblemFavoriteStarProps {
    isFavorite: boolean;
    problemId: number;
}

export const ProblemFavoriteStar = ({ isFavorite, problemId }: ProblemFavoriteStarProps) => {
    const addToFavoritesMutation = useAddProblemToFavoritesMutation();
    const removeFromFavoritesMutation = useRemoveProblemFromFavoritesMutation();

    const icon = isFavorite ? <IconStarSolid size="s" /> : <IconStarOutline size="s" />;
    const onClick = () => {
        isFavorite ? removeFromFavoritesMutation.mutate({ problemId }) : addToFavoritesMutation.mutate({ problemId });
    };

    return <Button view="clear" onClick={onClick} iconLeft={icon} />;
};
