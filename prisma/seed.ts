/* eslint-disable no-await-in-loop */
import { PrismaClient, ProblemDifficulty, SolutionResult } from '@prisma/client';
import { addDays, set as modifyDateTime } from 'date-fns';
import format from 'date-fns/format';

import { generateColor } from '../src/utils/color';
import { SectionType } from '../src/utils/dictionaries';

const prisma = new PrismaClient();

const fizzBuzzDescription = `Implement a function that prints numbers from 1 to n to the console,
where n is an integer that the function takes as a parameter, while:
- displays fizz instead of multiples of 3;
- displays buzz instead of multiples of 5;
- displays fizzbuzz instead of multiples of both 3 and 5.`;

const fizzBuzzSolution = `\`\`\`javascript
function fizzBuzz(n) {
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      console.log('fizzbuzz');
    } else if (i % 3 === 0) {
      console.log('fizz');
    } else if (i % 5 === 0) {
      console.log('buzz');
    } else {
      console.log(i)
    }
  }
}
fizzBuzz(20);
\`\`\``;

const promiseAllDescription = `Implement a polyfill for Promise.all.
The function argument is always an array with Promise objects,
in other words, type checking is not required, but it's good if the candidate mentions this`;

const promiseAllSolution = `\`\`\`javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const result = new Array(promises.length);
    let counter = 0;

    for (let i = 0; i < promises.length; i++) {
      promises[i].then((data) => {
        counter++;
        result[i] = data;
        if (counter === promises.length) {
          resolve(result);
        }
      }).catch((err) => {
        reject(err);
      })
    }
  });
}

promiseAll([
  Promise.resolve(1),
  fetch(...), // 20
  fetch(...), // 30
  fetch(...), // 40
  Promise.resolve(10),
]).then((result) => {
  assert.eq(result, [1, 20, 30, 40, 10]);
})
\`\`\``;

const linkedListDescription = 'Various Tasks for Implementing Linked List Methods';

const linkedListSolution = `\`\`\`javascript
class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }
}
\`\`\``;

const quickSortDescription = 'Write an implementation of quicksort';

const quickSortSolution = `\`\`\`javascript
function quickSort(arr) {
  const size = arr.length;

  if (size <= 1) {
    return arr;
  }

  /**
   * Here you can ask about the method of choosing a pivot-point.
   * The general approach is to choose a central element, but British scientists
   * proved that a random element on large arrays gives better performance
   */
  const index = Math.floor(Math.random() * arr.length);
  const pivot = arr[index];

  let left = [];
  let right = [];

  for (let i = 0; i < size; i++) {
    if (i !== index) {
      if (arr[i] < pivot) {
        left.push(arr[i]);
      }
      if (arr[i] >= pivot) {
        right.push(arr[i]);
      }
    }
  }

  return [
    ...quickSort(left),
    pivot,
    ...quickSort(right),
  ];
}
\`\`\``;

const stringForEachDescription = `\`\`\`javascript
const str = 'fasdaovjajvpqojrevqe';
str.forEach(console.log)
\`\`\`

Of course, this code will not work.
But it can be remade so that it works (outputs a character to the console).
How to achieve this? What are the pitfalls? What methods are dangerous to use?`;

const stringForEachSolution = `Solutions, in ascending order of darkness:

\`\`\`javascript
str.split('').forEach(console.log)
Array.from(str).forEach(console.log)
\`\`\`

The code is safe, but will create an unnecessary array and waste resources on it.

\`\`\`javascript
Array.prototype.forEach.call(str, console.log)
Array.prototype.forEach.apply(str, [console.log])
Array.prototype.forEach.bind(str)(console.log)
\`\`\`

The code is dangerous because it replaces the type in this. But it does not spoil the
prototypes and it will work specifically for the string.
It would be nice to remember how call|bind|apply differs from scenarios for more legal use.

\`\`\`javascript
String.prototype.forEach = Array.prototype.forEach
\`\`\`

the worst code, spoils the prototype, you can t do this, but it s worth remembering.`;

const problemsData = [
    { name: 'Fizz Buzz', description: fizzBuzzDescription, solution: fizzBuzzSolution },
    { name: 'Promise.all', description: promiseAllDescription, solution: promiseAllSolution },
    { name: 'Linked list', description: linkedListDescription, solution: linkedListSolution },
    { name: 'Quick sort', description: quickSortDescription, solution: quickSortSolution },
    { name: 'Foreach theft', description: stringForEachDescription, solution: stringForEachSolution },
];

const usersData = [
    {
        name: 'Timur',
        email: 'timur@hire.mail',
    },
    {
        name: 'Katrin',
        email: 'katrin@hire.mail',
    },
    {
        name: 'Viktor',
        email: 'viktor@hire.mail',
    },
    {
        name: 'Arthur',
        email: 'arthur@hire.mail',
    },
    {
        name: 'Vadim',
        email: 'vadim@hire.mail',
    },
];

const tagsData = [
    { name: 'JS' },
    { name: 'Async' },
    { name: 'Data structures' },
    { name: 'Computer science' },
    { name: 'Prototype' },
];

const outstaffVendorsData = [
    { title: 'OutstaffCo' },
    { title: 'MadCoders' },
    { title: 'SomeGoodGuys LTD' },
    { title: 'HeadAndShoulder' },
    { title: 'Qwerty' },
    { title: 'Umbrella corp' },
    { title: 'Team Rocket' },
];

const candidatesData = [
    { name: 'Pikachu' },
    { name: 'Bulbasaur' },
    { name: 'Charmander' },
    { name: 'Pidgey' },
    { name: 'Rattata' },
    { name: 'Vulpix' },
    { name: 'Jigglypuff' },
    { name: 'Psyduck' },
    { name: 'Slowpoke' },
    { name: 'Hitmonchan' },
    { name: 'Magikarp' },
    { name: 'Sukamon' },
];

const rejectReasons = [
    'The candidate accepted another offer',
    'The candidate did not pass the section',
    'The candidate passed the sections, but there is no suitable grade',
    'Not suitable for Soft skills',
    'Failed Security Check',
    'Failure at the final sections',
    'Rejection following the results of 1 technical section',
    'Rejection following the results of the 2nd technical section',
    'Rejection following the results of the 3rd technical section',
    'According to the results of the section, they were rated for a lower grade',
    'Self-refusal - received an offer during the interview process',
    'Self-refusal - at the final I accepted an offer from another company',
    'Self-rejection - at the final he took a controffer',
    'Self-rejection - did not come to the interview',
];

export const gradeOptionsPackages = {
    hire: ['HIRE'],
    juniorMiddleSenior: ['JUNIOR', 'MIDDLE', 'SENIOR'],
};

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomBoolean = (): boolean => Math.random() < 0.5;

const randomEnumElement = <T>(e: T): T[keyof T] => {
    const enumValues = Object.values(e as any) as unknown as T[keyof T][];
    const randomIndex = Math.floor(Math.random() * enumValues.length);

    return enumValues[randomIndex];
};

const randomString = (
    length: number,
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
): string => {
    let result = '';
    const alphabetLength = alphabet.length;
    for (let i = 0; i < length; i++) {
        result += alphabet.charAt(Math.floor(Math.random() * alphabetLength));
    }

    return result;
};

const numbers = '0123456789';
const randomPhone = (): string =>
    `+7 ${randomString(3, numbers)} ${randomString(3, numbers)} ${randomString(4, numbers)}`;

const main = async () => {
    const users = await Promise.all(usersData.map((data) => prisma.user.create({ data })));

    const tags = await Promise.all(tagsData.map((data) => prisma.tag.create({ data })));

    await prisma.appConfig.create({ data: {} });

    await prisma.filter.create({
        data: {
            entity: 'Candidate',
            params: 'createdAt=@current',
            default: true,
        },
    });

    const problems = await Promise.all(
        problemsData.map((data) =>
            prisma.problem.create({
                data: {
                    ...data,
                    difficulty: randomEnumElement(ProblemDifficulty),
                    author: { connect: { id: randomElement(users).id } },
                    tags: { connect: [{ id: randomElement(tags).id }, { id: randomElement(tags).id }] },
                },
            }),
        ),
    );

    const outstaffVendors = await Promise.all(
        outstaffVendorsData.map((data) => prisma.outstaffVendor.create({ data })),
    );

    const candidates = await Promise.all(
        candidatesData.map((data) =>
            prisma.candidate.create({
                data: {
                    ...data,
                    ...(randomBoolean()
                        ? { email: `${data.name.toLowerCase()}@pokemon.jp`, phone: randomPhone() }
                        : { outstaffVendor: { connect: { id: randomElement(outstaffVendors).id } } }),
                },
            }),
        ),
    );

    const sectionTypeScreeningTemplate = {
        title: 'Screening',
        value: SectionType.SCREENING,
        hasTasks: true,
        userSelect: false,
        gradeOptions: gradeOptionsPackages.hire,
        eventColor: generateColor(),
    };

    const sectionTypeCodingTemplate = {
        title: 'Coding',
        value: SectionType.CODING,
        hasTasks: true,
        userSelect: false,
        gradeOptions: gradeOptionsPackages.juniorMiddleSenior,
        eventColor: generateColor(),
    };

    const sectionTypeFinalTemplate = {
        title: 'Final',
        value: SectionType.FINAL,
        hasTasks: false,
        userSelect: false,
        gradeOptions: gradeOptionsPackages.juniorMiddleSenior,
        eventColor: generateColor(),
    };

    const sectionTypeProductFinalTemplate = {
        title: 'Product final',
        value: SectionType.PRODUCT_FINAL,
        hasTasks: false,
        userSelect: true,
        showOtherGrades: true,
        gradeOptions: gradeOptionsPackages.hire,
        eventColor: generateColor(),
    };

    await prisma.grades.createMany({ data: Object.values(gradeOptionsPackages).map((options) => ({ options })) });

    const hireStreamFrontendJs = await prisma.hireStream.create({
        data: {
            name: 'FRONTENDJS',
            displayName: 'frontend-js',
            hiringLeads: { connect: { id: randomElement(users).id } },
            recruiters: { connect: { id: randomElement(users).id } },
        },
    });
    const hireStreamQa = await prisma.hireStream.create({
        data: {
            name: 'QA',
            displayName: 'qa',
            hiringLeads: { connect: { id: randomElement(users).id } },
            recruiters: { connect: { id: randomElement(users).id } },
        },
    });
    const hireStreamInfra = await prisma.hireStream.create({
        data: {
            name: 'INFRA',
            displayName: 'infrastructure',
            hiringLeads: { connect: { id: randomElement(users).id } },
            recruiters: { connect: { id: randomElement(users).id } },
        },
    });

    const hireStreamToSectionTypes = [
        {
            hireStream: hireStreamFrontendJs,
            sectionTypes: [
                sectionTypeScreeningTemplate,
                sectionTypeCodingTemplate,
                sectionTypeFinalTemplate,
                sectionTypeProductFinalTemplate,
            ],
        },
        {
            hireStream: hireStreamQa,
            sectionTypes: [sectionTypeScreeningTemplate, sectionTypeCodingTemplate, sectionTypeFinalTemplate],
        },
        {
            hireStream: hireStreamInfra,
            sectionTypes: [sectionTypeScreeningTemplate, sectionTypeFinalTemplate],
        },
    ];

    for (const hireStreamData of hireStreamToSectionTypes) {
        for (const sectionTypeData of hireStreamData.sectionTypes) {
            await prisma.sectionType.create({
                data: {
                    ...sectionTypeData,
                    hireStream: { connect: { id: hireStreamData.hireStream.id } },
                    interviewers: { connect: { id: randomElement(users).id } },
                },
            });
        }
    }

    for (const candidate of candidates) {
        const creator = randomElement(users);
        const hireStreamData = randomElement(hireStreamToSectionTypes);
        const { hireStream, sectionTypes } = hireStreamData;

        const interview = await prisma.interview.create({
            data: {
                description: `Interview with ${candidate.name}`,
                creatorId: creator.id,
                candidateId: candidate.id,
                hireStreamId: hireStream.id,
            },
        });

        for (const sectionType of sectionTypes) {
            const sectionTypeFromDb = await prisma.sectionType.findFirst({
                where: { hireStreamId: hireStream.id, value: sectionType.value },
            });

            if (!sectionTypeFromDb) {
                throw new Error(`Section type ${sectionType.value} is not found in hire stream ${hireStream.name}`);
            }
            const interviewer = randomElement(users);
            const section = await prisma.section.create({
                data: {
                    description: `${sectionType.title} with ${candidate.name}`,
                    grade: randomElement(Object.values(gradeOptionsPackages).flat()),
                    sectionTypeId: sectionTypeFromDb.id,
                    interviewId: interview.id,
                    interviewers: { connect: [{ id: interviewer.id }] },
                },
            });

            const problem1 = randomElement(problems);

            await prisma.solution.create({
                data: {
                    sectionId: section.id,
                    problemId: problem1.id,
                    answer: `Solution "${problem1.name}" from ${candidate.name}`,
                    result: randomEnumElement(SolutionResult),
                },
            });

            const problem2 = randomElement(problems);

            if (problem1.id !== problem2.id) {
                await prisma.solution.create({
                    data: {
                        sectionId: section.id,
                        problemId: problem2.id,
                        answer: `Solution "${problem2.name}" from ${candidate.name}`,
                        result: randomEnumElement(SolutionResult),
                    },
                });
            }
        }
    }

    for (const reason of rejectReasons) {
        await prisma.rejectReason.create({ data: { text: reason } });
    }

    const now = new Date();
    const todayAt18 = modifyDateTime(now, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
    const todayAt18RruleFormat = format(todayAt18, "yyyyMMdd'T'HHmmss'Z'");
    const twoDaysLaterAt18 = addDays(todayAt18, 2);
    const twoDaysLaterAt9 = modifyDateTime(twoDaysLaterAt18, { hours: 9 });
    const fiveDaysLaterAt18 = addDays(todayAt18, 5);

    await prisma.calendarEvent.create({
        data: {
            rule: `DTSTART:${todayAt18RruleFormat}\nRRULE:FREQ=DAILY`,
            eventDetails: {
                create: {
                    title: 'Yoga',
                    description: 'mindful yoga',
                    duration: 60,
                },
            },
            exceptions: {
                create: {
                    originalDate: twoDaysLaterAt18,
                    date: twoDaysLaterAt9,
                    eventDetails: {
                        create: {
                            title: 'Yoga in the morning',
                            description: 'mindful yoga',
                            duration: 120,
                        },
                    },
                },
            },
            cancellations: {
                create: {
                    originalDate: fiveDaysLaterAt18,
                },
            },
        },
    });

    await prisma.apiToken.create({ data: { id: '849892e1-6518-4843-9530-006216245037', description: 'test-token' } });
};

main()
    .catch((e) => {
        // Intentional logging
        // eslint-disable-next-line no-console
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
