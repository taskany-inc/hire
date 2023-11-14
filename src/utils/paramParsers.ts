import { isNumberString } from './typeGuards';

export const parseNumber = (value: unknown): number | undefined => (isNumberString(value) ? +value : undefined);
