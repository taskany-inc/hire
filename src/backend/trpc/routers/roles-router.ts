import { accessMiddlewares } from '../../access/access-middlewares';
import { rolesDbService } from '../../modules/roles/roles-db-service';
import {
    getUsersByHireStreamIdSchema,
    hireStreamIdAndSectionTypeIdAndUserIdSchema,
    hireStreamIdAndUserIdSchema,
} from '../../modules/roles/roles-types';
import { protectedProcedure, router } from '../trpc-back';

export const rolesRouter = router({
    getAllAdmins: protectedProcedure.use(accessMiddlewares.roles.readAdmins).query(() => {
        return rolesDbService.getAllAdmins();
    }),

    getUsersByHireStream: protectedProcedure
        .input(getUsersByHireStreamIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .query(({ input }) => {
            return rolesDbService.getUsersByHireStream(input);
        }),

    addHireStreamManagerToHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesDbService.addHireStreamManagerToHireStream(input);
        }),

    removeHireStreamManagerFromHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesDbService.removeHireStreamManagerFromHireStream(input);
        }),

    addHiringLeadToHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesDbService.addHiringLeadToHireStream(input);
        }),

    removeHiringLeadFromHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesDbService.removeHiringLeadFromHireStream(input);
        }),

    addRecruiterToHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesDbService.addRecruiterToHireStream(input);
        }),

    removeRecruiterFromHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesDbService.removeRecruiterFromHireStream(input);
        }),

    addInterviewerToSectionType: protectedProcedure
        .input(hireStreamIdAndSectionTypeIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesDbService.addInterviewerToSectionType(input);
        }),

    removeInterviewerFromSectionType: protectedProcedure
        .input(hireStreamIdAndSectionTypeIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesDbService.removeInterviewerFromSectionType(input);
        }),
});
