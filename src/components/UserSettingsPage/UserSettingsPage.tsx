import { useTheme } from 'next-themes';
import { Fieldset, Form, FormRadio, FormRadioInput } from '@taskany/bricks';
import styled from 'styled-components';

import { Theme, themes } from '../../utils/theme';
import { trpc } from '../../trpc/trpcClient';
import { useEditUserSettings } from '../../modules/userHooks';
import { SettingsCard, SettingsContainer } from '../Settings';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { PageSep } from '../PageSep';
import { languages } from '../../utils/getLang';

import { tr } from './UserSettingsPage.i18n';

const StyledPageSep = styled(PageSep)`
    margin-left: -40px;
`;

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
            <StyledPageSep />

            <SettingsContainer>
                <SettingsCard>
                    <Form>
                        <Fieldset title={tr('Appearance')}>
                            <FormRadio
                                label={tr('Theme')}
                                name="theme"
                                value={settings.theme}
                                onChange={(v) => onThemeChange(v as Theme)}
                            >
                                {themes.map((t) => (
                                    <FormRadioInput key={t} value={t} label={t} />
                                ))}
                            </FormRadio>

                            <FormRadio
                                label={tr('Locale')}
                                name="locale"
                                value={settings.locale}
                                onChange={(v) => onLocaleChange(v)}
                            >
                                {languages.map((language) => (
                                    <FormRadioInput key={language} value={language} label={language} />
                                ))}
                            </FormRadio>
                        </Fieldset>
                    </Form>
                </SettingsCard>
            </SettingsContainer>
        </LayoutMain>
    );
};
