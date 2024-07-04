import { prisma } from '../utils/prisma';

import { CheckWhatsnew, MarkRelease } from './whatsnewTypes';

const check = async ({ locale, userSettingId }: CheckWhatsnew) => {
    let delayed = false;
    let read = false;
    let createdAt: Date | undefined;

    const rawReleaseVersion = await fetch(`${process.env.PUBLIC_URL}/version.txt`).then((res) => res.text());
    const version = rawReleaseVersion.replace(/\n/g, '');

    const releaseNotesExists =
        (await fetch(`${process.env.PUBLIC_URL}/${locale}/whatsnew/${version}/${locale}`)).status === 200;

    if (version && releaseNotesExists) {
        let release = await prisma.release.findFirst({
            where: { version },
            include: {
                readers: { where: { id: userSettingId } },
                delayers: { where: { id: userSettingId } },
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

const markAsRead = ({ userSettingId, version }: MarkRelease) => {
    return prisma.release.update({
        where: {
            version,
        },
        data: {
            readers: {
                connect: [{ id: userSettingId }],
            },
        },
    });
};

const markAsDelayed = ({ userSettingId, version }: MarkRelease) => {
    return prisma.release.update({
        where: {
            version,
        },
        data: {
            delayers: {
                connect: [{ id: userSettingId }],
            },
        },
    });
};

export const whatsnewMethods = {
    check,
    markAsRead,
    markAsDelayed,
};
