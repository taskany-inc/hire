export const getFileIdFromPath = (
    /** /api/attach?id=... */
    path: string,
) => path.substring(15);
