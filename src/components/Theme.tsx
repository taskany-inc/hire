import { nullable } from '@taskany/bricks';
import dynamic from 'next/dynamic';

const themes = {
    dark: dynamic(() => import('@taskany/colors/themes/dark')),
    light: dynamic(() => import('@taskany/colors/themes/light')),
};

export const Theme: React.FC<{ theme: keyof typeof themes }> = ({ theme = 'dark' }) => {
    const ThemeComponent = themes[theme];

    return (
        <>
            {nullable(ThemeComponent, () => (
                <ThemeComponent />
            ))}
        </>
    );
};
