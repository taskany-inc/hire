/* eslint-disable camelcase */
import { Prisma } from '@prisma/client';
import groupBy from 'lodash.groupby';
import mapValues from 'lodash.mapvalues';
import mapKeys from 'lodash.mapkeys';
import { Session } from 'next-auth';

import { prisma } from '../..';
import { hireStreamDbService } from '../hire-streams/hire-stream-db-service';
import { objKeys } from '../../../utils';

import {
    HireStreamAndTimeRange,
    HiringBySectionTypeOutput,
    HiringBySectionTypeRawData,
    HireStreamsAndTimeRange,
    HiringFunnelOutput,
    HiringFunnelRawData,
    FinihedSectionsByInterviewerOutput,
    FinishedSectionsByInterviewerRawData,
    CandidatesByHireStreamRawData,
    CandidatesByHireStreamOutput,
    CandidatesRejectReasonsRawData,
    CandidatesRejectReasonsOutput,
    GradesByInterviewerOutput,
    GradesByInterviewerRawData,
    SectionTypeToGradesByInterviewerOutput,
    hireStreamsAndTimeRangeAndHasTasks,
} from './analytics-queries-types';

const prepareLabel = (s: string): string =>
    s.replace('analytics_event__', '').replace('user__', '').replace('_count', '').replace(/_/g, ' ');

const hiringFunnel = async (params: HireStreamsAndTimeRange, session: Session): Promise<HiringFunnelOutput> => {
    const hireStreamNames = await hireStreamDbService.allowedHiringStreamsByName(session, params.hireStreams);
    const rawData: HiringFunnelRawData = await prisma.$queryRaw`
SELECT
  count(
    distinct CASE
      WHEN ("analytics_event".event = 'interview_created') THEN "analytics_event"."candidateId"
    END
  ) "analytics_event__candidates_with_interview_count",
  count(
    distinct CASE
      WHEN ("analytics_event".hire = 'true')
      AND (
        "analytics_event".event = 'candidate_finished_section'
      ) THEN "analytics_event"."candidateId"
    END
  ) "analytics_event__passed_section_count",
  count(
    distinct CASE
      WHEN ("analytics_event".hire = 'true')
      AND (
        "analytics_event".event = 'candidate_finished_interview'
      ) THEN "analytics_event"."candidateId"
    END
  ) "analytics_event__hired_count"
FROM
  public."AnalyticsEvent" AS "analytics_event"
WHERE
  (
    "analytics_event".timestamp >= ${params.from}
    AND "analytics_event".timestamp <= ${params.to}
    AND "analytics_event"."hireStream" IN (${Prisma.join(hireStreamNames)})
  )
ORDER BY
  1 ASC
LIMIT
  5500
`;

    const data: HiringFunnelOutput = objKeys(rawData[0]).map((k) => ({
        value: rawData[0][k],
        label: prepareLabel(k),
    }));

    return data;
};

export const hiringBySectionType = async (params: HireStreamAndTimeRange): Promise<HiringBySectionTypeOutput> => {
    const sectionTypes = await prisma.sectionType.findMany({ where: { hireStream: { name: params.hireStreamName } } });
    const sectionTypeValues = sectionTypes.map((s) => s.value);

    const rawData: HiringBySectionTypeRawData = await prisma.$queryRaw`
SELECT
  "section_type".title "section_type__title",
  "section".hire "section__hire",
  count("section".id) "section__count"
FROM
  public."Section" AS "section"
  LEFT JOIN public."SectionType" AS "section_type" ON "section"."sectionTypeId" = "section_type".id
WHERE
  (
    "section"."createdAt" >= ${params.from}
    AND "section"."createdAt" <= ${params.to}
    AND "section_type".value IN (${Prisma.join(sectionTypeValues)})
  )
  AND ("section".hire IS NOT NULL)
GROUP BY
  1,
  2
ORDER BY
  3 DESC
`;

    const dataRecord: Record<string, { hire: number; noHire: number }> = {};

    rawData.forEach((item) => {
        if (!dataRecord[item.section_type__title]) {
            dataRecord[item.section_type__title] = { hire: 0, noHire: 0 };
        }

        if (item.section__hire) {
            dataRecord[item.section_type__title].hire = item.section__count;
        } else {
            dataRecord[item.section_type__title].noHire = item.section__count;
        }
    });

    const pivotedData: HiringBySectionTypeOutput = objKeys(dataRecord).map((k) => ({
        sectionType: k,
        hire: dataRecord[k].hire,
        noHire: dataRecord[k].noHire,
    }));

    return pivotedData;
};

const finishedSectionsByInterviewer = async (
    params: hireStreamsAndTimeRangeAndHasTasks,
    session: Session,
): Promise<FinihedSectionsByInterviewerOutput> => {
    const hireStreamNames = await hireStreamDbService.allowedHiringStreamsByName(session, params.hireStreams);
    const rawData: FinishedSectionsByInterviewerRawData = await prisma.$queryRaw`
SELECT
  "user".name "user__name",
  "analytics_event"."hireStream" "analytics_event__hirestream",
  count(distinct "analytics_event"."sectionId") "analytics_event__section_count"
FROM
  public."AnalyticsEvent" AS "analytics_event"
  LEFT JOIN public."User" AS "user" ON "analytics_event"."interviewerId" = "user".id
  LEFT JOIN public."Section" AS "section" ON "analytics_event"."sectionId" = "section".id
  LEFT JOIN public."SectionType" AS "section_type" ON "section"."sectionTypeId" = "section_type".id
WHERE
  (
    "analytics_event".timestamp >= ${params.from} :: timestamptz
    AND "analytics_event".timestamp <= ${params.to} :: timestamptz
  )
  AND ("analytics_event".event = 'candidate_finished_section')
  AND ("analytics_event"."hireStream" IN (${Prisma.join(hireStreamNames)}))
  AND ("section_type"."hasTasks" = ${params.hasTasks})
GROUP BY
  1,
  2
ORDER BY
  3 DESC
LIMIT
  10000
`;

    const data = rawData.map((item: any) =>
        Object.fromEntries(Object.entries(item).map(([k, v]) => [prepareLabel(k), v])),
    ) as FinihedSectionsByInterviewerOutput;

    return data;
};

const candidatesByHireStream = async (params: HireStreamsAndTimeRange, session: Session) => {
    const hireStreamNames = await hireStreamDbService.allowedHiringStreamsByName(session, params.hireStreams);
    const rawData: CandidatesByHireStreamRawData = await prisma.$queryRaw`
SELECT
  "analytics_event"."hireStream" "analytics_event__hirestream",
  count(distinct "analytics_event"."candidateId") "analytics_event__candidate_count"
FROM
  public."AnalyticsEvent" AS "analytics_event"
WHERE
  (
    "analytics_event".timestamp >= ${params.from} :: timestamptz
    AND "analytics_event".timestamp <= ${params.to} :: timestamptz
  )
  AND ("analytics_event".event = 'candidate_finished_interview')
  AND ("analytics_event".hire = 'true')
  AND ("analytics_event"."hireStream" IN (${Prisma.join(hireStreamNames)}))
GROUP BY
  1
ORDER BY
  2 DESC
LIMIT
  10000
`;

    const data = rawData.map((item) =>
        Object.fromEntries(Object.entries(item).map(([k, v]) => [prepareLabel(k), v])),
    ) as CandidatesByHireStreamOutput;

    return data;
};

const REJECT_REASON_GROUP_THRESHOLD = 5;

const candidatesRejectReasons = async (
    params: HireStreamsAndTimeRange,
    session: Session,
): Promise<CandidatesRejectReasonsOutput> => {
    const hireStreamNames = await hireStreamDbService.allowedHiringStreamsByName(session, params.hireStreams);

    const rawData: CandidatesRejectReasonsRawData = await prisma.$queryRaw`
SELECT
  "analytics_event"."rejectReason" "analytics_event__rejectreason",
  count(distinct "analytics_event"."candidateId") "analytics_event__candidate_count"
FROM
  public."AnalyticsEvent" AS "analytics_event"
WHERE
  (
    "analytics_event".timestamp >= ${params.from} :: timestamptz
    AND "analytics_event".timestamp <= ${params.to} :: timestamptz
  )
  AND ("analytics_event".event = 'candidate_finished_interview')
  AND ("analytics_event".hire = 'false')
  AND ("analytics_event"."hireStream" IN (${Prisma.join(hireStreamNames)}))
GROUP BY
  1
ORDER BY
  2 DESC
LIMIT
  10000
`;

    const data = rawData.map((item) =>
        Object.fromEntries(Object.entries(item).map(([k, v]) => [prepareLabel(k), v])),
    ) as CandidatesRejectReasonsOutput;

    let other = 0;

    const filteredData = data.filter((item) => {
        if (item.candidate < REJECT_REASON_GROUP_THRESHOLD) {
            other += item.candidate;

            return false;
        }

        return true;
    });

    filteredData.push({ rejectreason: 'Another reasons', candidate: other });

    return filteredData;
};

const gradesByInterviewer = async (
    params: HireStreamAndTimeRange,
    sectionType: string,
): Promise<GradesByInterviewerOutput> => {
    const rawData: GradesByInterviewerRawData = await prisma.$queryRaw`
SELECT
  "user".name "user__name",
  "analytics_event".grade "analytics_event__grade",
  count(distinct "analytics_event"."sectionId") "analytics_event__section_count"
FROM
  public."AnalyticsEvent" AS "analytics_event"
  LEFT JOIN public."User" AS "user" ON "analytics_event"."interviewerId" = "user".id
WHERE
  (
    "analytics_event".timestamp >= ${params.from} :: timestamptz
    AND "analytics_event".timestamp <= ${params.to} :: timestamptz
  )
  AND ("analytics_event".event = 'candidate_finished_section')
  AND ("analytics_event"."hireStream" = ${params.hireStreamName})
  AND ("analytics_event"."sectionType" = ${sectionType})
GROUP BY
  1,
  2
ORDER BY
  3 DESC
LIMIT
  10000
`;

    const groupped = mapValues(
        groupBy(rawData, (item) => item.user__name),
        (v) => groupBy(v, (item) => item.analytics_event__grade),
    );
    const mapped = mapValues(groupped, (item) =>
        mapKeys(
            mapValues(item, (item) => item[0].analytics_event__section_count),
            (v, k) => (k === 'null' ? 'NO_HIRE' : k),
        ),
    );

    return Object.entries(mapped).map(([k, v]) => ({ name: k, grades: v }));
};

const sectionTypeToGradesByInterviewer = async (
    params: HireStreamAndTimeRange,
): Promise<SectionTypeToGradesByInterviewerOutput> => {
    const sectionTypes = await prisma.sectionType.findMany({ where: { hireStream: { name: params.hireStreamName } } });
    const sectionTypeValues = sectionTypes.map((s) => s.value);

    const result: SectionTypeToGradesByInterviewerOutput = {};

    for (const sectionType of sectionTypeValues) {
        // eslint-disable-next-line no-await-in-loop
        const data = await gradesByInterviewer(params, sectionType);
        result[sectionType] = data;
    }

    return result;
};

export const analyticsEventQueryDbService = {
    hiringFunnel,
    hiringBySectionType,
    finishedSectionsByInterviewer,
    candidatesByHireStream,
    candidatesRejectReasons,
    sectionTypeToGradesByInterviewer,
};
