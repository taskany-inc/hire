import { useTheme } from 'next-themes';
import { Fieldset, RadioControl, RadioGroup, RadioGroupLabel, CardContent } from '@taskany/bricks/harmony';

import { Theme, themes } from '../../utils/theme';
import { trpc } from '../../trpc/trpcClient';
import { useEditUserSettings } from '../../modules/userHooks';
import { SettingsCard, SettingsContainer } from '../Settings/Settings';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { languages } from '../../utils/getLang';

import { tr } from './UserSettingsPage.i18n';
import s from './UserSettingsPage.module.css';

interface UserSettingsPageProps {
    userId: number;
}

export const UserSettingsPage = ({ userId }: UserSettingsPageProps) => {
    const editUserSettings = useEditUserSettings();
    const { setTheme } = useTheme();

    const userQuery = trpc.users.getById.useQuery(userId);
    const user = userQuery.data;

    const settingsQuery = trpc.users.getSettings.useQuery();
    const settings = settingsQuery.data;

    if (!user || !settings) return null;

    const onThemeChange = (theme: Theme) => {
        editUserSettings.mutateAsync({ theme });
        setTheme(theme);
    };

    const onLocaleChange = (locale: string) => {
        editUserSettings.mutateAsync({ locale });
    };

    return (
        <LayoutMain pageTitle={user.name || user.email}>
            <SettingsContainer>
                <SettingsCard>
                    <CardContent view="transparent">
                        <form>
                            <Fieldset title={tr('Appearance')}>
                                <RadioGroup
                                    name="theme"
                                    className={s.FormControl}
                                    value={settings.theme}
                                    onChange={(e) => onThemeChange(e.target.value as Theme)}
                                >
                                    <RadioGroupLabel className={s.FormControlLabel}>{tr('Theme')}</RadioGroupLabel>
                                    {themes.map((t) => (
                                        <RadioControl key={t} value={t} name={t}>
                                            {t}
                                        </RadioControl>
                                    ))}
                                </RadioGroup>
                            </Fieldset>
                        </form>
                    </CardContent>
                </SettingsCard>

                <SettingsCard>
                    <CardContent view="transparent">
                        <Fieldset title={tr('Locale')}>
                            <RadioGroup
                                className={s.FormControl}
                                name="locale"
                                value={settings.locale}
                                onChange={(e) => onLocaleChange(e.target.value)}
                            >
                                <RadioGroupLabel className={s.FormControlLabel}>{tr('Locale')}</RadioGroupLabel>
                                {languages.map((language) => (
                                    <RadioControl value={language} key={language}>
                                        {language}
                                    </RadioControl>
                                ))}
                            </RadioGroup>
                        </Fieldset>
                    </CardContent>
                </SettingsCard>
            </SettingsContainer>
        </LayoutMain>
    );
};
