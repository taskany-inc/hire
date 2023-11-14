/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import { PrismaClient, SolutionResult } from '@prisma/client';

import { symbols } from '../utils/symbols';

const prisma = new PrismaClient();

const delay = (seconds: number): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
    });

const waitForConfirmation = async (message: string): Promise<boolean> => {
    process.stdin.setRawMode(true);
    process.stdin.setEncoding('utf8');

    process.stdin.write(`${message} y/N `);

    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            process.stdin.setRawMode(false);
            const str = String(data);
            resolve(str === 'y' || str === 'Y');
        });
    });
};

const checkProblemSolutionCounters = async () => {
    console.log('=== CHECKING COUNTERS OF PROBLEM SOLUTIONS ===');

    const problems = await prisma.problem.findMany({
        select: { id: true, name: true, solutionsGood: true, solutionsOk: true, solutionsBad: true },
        orderBy: { id: 'asc' },
    });

    console.log(`Total problem in the database - ${problems.length}`);

    await delay(1);

    for (const problem of problems) {
        console.log(`\nChecking the problem ${problem.id} (${problem.name})`);
        const solutionsGood = await prisma.solution.count({
            where: { problemId: problem.id, result: SolutionResult.GOOD },
        });
        const solutionsOk = await prisma.solution.count({
            where: { problemId: problem.id, result: SolutionResult.OK },
        });
        const solutionsBad = await prisma.solution.count({
            where: { problemId: problem.id, result: SolutionResult.BAD },
        });

        if (
            solutionsGood !== problem.solutionsGood ||
            solutionsOk !== problem.solutionsOk ||
            solutionsBad !== problem.solutionsBad
        ) {
            console.log(`${symbols.yellowCircle} counter mismatch detected`);
            console.table([
                { result: SolutionResult.GOOD, counter: problem.solutionsGood, real: solutionsGood },
                { result: SolutionResult.OK, counter: problem.solutionsOk, real: solutionsOk },
                { result: SolutionResult.BAD, counter: problem.solutionsBad, real: solutionsBad },
            ]);

            const shouldFix = await waitForConfirmation('Fix the values ​​in the database?');

            if (shouldFix) {
                console.log('\nCorrecting the values...');
                await prisma.problem.update({
                    where: { id: problem.id },
                    data: { solutionsGood, solutionsOk, solutionsBad },
                });
            } else {
                console.log('\nSkipping');
            }
        }

        await delay(0.1);
    }
};

const main = async () => {
    await checkProblemSolutionCounters();
    process.stdin.unref();
};

main();
