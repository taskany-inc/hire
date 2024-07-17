import config from '../config';
import { prisma } from '../utils/prisma';

import { userMethods } from './userMethods';
import { CheckRelease, MarkRelease, WithUserId } from './whatsnewTypes';

const check = async ({ locale, userId }: CheckRelease & WithUserId) => {
    let delayed = false;
    let read = false;
    let createdAt: Date | undefined;

    const rawReleaseVersion = await fetch(`${config.defaultPageURL}/version.txt`).then((res) => res.text());
    const version = rawReleaseVersion.replace(/\n/g, '');

    const releaseNotesExists =
        (await fetch(`${config.defaultPageURL}/${locale}/whatsnew/${version}/${locale}`)).status === 200;

    if (version && releaseNotesExists) {
        const userSettings = await userMethods.getSettings(userId);

        let release = await prisma.release.findFirst({
            where: { version },
            include: {
                readers: { where: { id: userSettings.id } },
                delayers: { where: { id: userSettings.id } },
            },
        });

        if (release) {
            read = Boolean(release.readers.length);
            delayed = Boolean(release.delayers.length);
        } else {
            release = await prisma.release.create({
                data: {
                    version,
                },
                include: { readers: true, delayers: true },
            });
        }

        createdAt = release.createdAt;
    }

    return {
        version,
        releaseNotesExists,
        read,
        delayed,
        createdAt,
    };
};

const markAsRead = async ({ userId, version }: MarkRelease & WithUserId) => {
    const userSettings = await userMethods.getSettings(userId);

    return prisma.release.update({
        where: {
            version,
        },
        data: {
            readers: {
                connect: [{ id: userSettings.id }],
            },
        },
    });
};

const markAsDelayed = async ({ userId, version }: MarkRelease & WithUserId) => {
    const userSettings = await userMethods.getSettings(userId);

    return prisma.release.update({
        where: {
            version,
        },
        data: {
            delayers: {
                connect: [{ id: userSettings.id }],
            },
        },
    });
};

export const whatsnewMethods = {
    check,
    markAsRead,
    markAsDelayed,
};
