/* eslint-disable */
// Do not edit, use generator to update
import { i18n, fmt, I18nLangSet } from 'easy-typed-intl';
import getLang from '../../../utils/getLang';

import en from './en.json';

export type I18nKey = keyof typeof en;
type I18nLang = 'en';

const keyset: I18nLangSet<I18nKey> = {};

keyset['en'] = en;

export const tr = i18n<I18nLang, I18nKey>(keyset, fmt, getLang);
