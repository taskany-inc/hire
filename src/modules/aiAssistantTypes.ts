import { z } from 'zod';

export const cvParsingResultSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    technologies: z.array(z.string()).optional(),
});
export type CvParsingResult = z.infer<typeof cvParsingResultSchema>;
