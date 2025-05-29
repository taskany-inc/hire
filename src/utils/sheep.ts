import { prisma } from './prisma';

const sheepEmail = process.env.SHEEP_EMAIL || 'sheep@taskany.org';
const sheepPassword = process.env.SHEEP_PASSWORD || 'taskany';

export const getSheep = () =>
    prisma.user.findUnique({
        where: {
            email: sheepEmail,
        },
    });

export const createSheep = () =>
    prisma.user.create({
        data: {
            email: sheepEmail,
            name: 'Taskany Sheep',
            accounts: {
                create: {
                    type: 'credentials',
                    provider: 'email',
                    providerAccountId: 'sheepCredentials',
                    password: sheepPassword,
                },
            },
        },
    });
