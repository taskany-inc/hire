import { z } from 'zod';

const technologiesArray = z.array(z.string());
const technologiesRecord = z.record(z.string(), technologiesArray);

export const cvParsingResultSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    technologies: z
        .union([
            technologiesArray,
            technologiesRecord,
            z.record(z.string(), z.union([technologiesArray, technologiesRecord])),
        ])
        .optional(),
});
export type CvParsingResult = z.infer<typeof cvParsingResultSchema>;
