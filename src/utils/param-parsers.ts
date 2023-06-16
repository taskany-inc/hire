import { isNumberString } from './type-guards';

export const parseNumber = (value: unknown): number | undefined => (isNumberString(value) ? +value : undefined);
