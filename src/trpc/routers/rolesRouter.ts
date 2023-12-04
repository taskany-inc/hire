import { accessMiddlewares } from '../../modules/accessMiddlewares';
import { rolesMethods } from '../../modules/rolesMethods';
import {
    addAndRemoveProblemEditorRoleSchema,
    getUsersByHireStreamIdSchema,
    hireStreamIdAndSectionTypeIdAndUserIdSchema,
    hireStreamIdAndUserIdSchema,
} from '../../modules/rolesTypes';
import { protectedProcedure, router } from '../trpcBackend';

export const rolesRouter = router({
    getAllAdmins: protectedProcedure.use(accessMiddlewares.roles.readAdmins).query(() => {
        return rolesMethods.getAllAdmins();
    }),

    getUsersByHireStream: protectedProcedure
        .input(getUsersByHireStreamIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .query(({ input }) => {
            return rolesMethods.getUsersByHireStream(input);
        }),

    addHireStreamManagerToHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesMethods.addHireStreamManagerToHireStream(input);
        }),

    removeHireStreamManagerFromHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesMethods.removeHireStreamManagerFromHireStream(input);
        }),

    addHiringLeadToHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesMethods.addHiringLeadToHireStream(input);
        }),

    removeHiringLeadFromHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesMethods.removeHiringLeadFromHireStream(input);
        }),

    addRecruiterToHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesMethods.addRecruiterToHireStream(input);
        }),

    removeRecruiterFromHireStream: protectedProcedure
        .input(hireStreamIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesMethods.removeRecruiterFromHireStream(input);
        }),

    addInterviewerToSectionType: protectedProcedure
        .input(hireStreamIdAndSectionTypeIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesMethods.addInterviewerToSectionType(input);
        }),

    removeInterviewerFromSectionType: protectedProcedure
        .input(hireStreamIdAndSectionTypeIdAndUserIdSchema)
        .use(accessMiddlewares.roles.readOrUpdateHireStreams)
        .mutation(({ input }) => {
            return rolesMethods.removeInterviewerFromSectionType(input);
        }),

    getAllproblemEditors: protectedProcedure.use(accessMiddlewares.roles.readAdmins).query(() => {
        return rolesMethods.getAllProblemEditors();
    }),

    addProblemEditorRole: protectedProcedure
        .input(addAndRemoveProblemEditorRoleSchema)
        .use(accessMiddlewares.roles.readAdmins)
        .mutation(({ input }) => {
            return rolesMethods.addProblemEditorRole(input);
        }),

    removeProblemEditorRole: protectedProcedure
        .input(addAndRemoveProblemEditorRoleSchema)
        .use(accessMiddlewares.roles.readAdmins)
        .mutation(({ input }) => {
            return rolesMethods.removeProblemEditorRole(input);
        }),
});
