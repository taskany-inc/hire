import { Section } from '../../../../../controllers/Section';
import { sectionDbService } from '../../../../../backend/modules/section/section-db-service';
import { InferServerSideProps } from '../../../../../types';
import { accessChecks } from '../../../../../backend/access/access-checks';
import { useSection } from '../../../../../hooks/section-hooks';
import { QueryResolver } from '../../../../../components/QueryResolver';
import { createGetServerSideProps } from '../../../../../utils/create-get-ssr-props';
import { Paths, generatePath } from '../../../../../utils/paths';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { interviewId: true, sectionId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        const section1 = await sectionDbService.getById(numberIds.sectionId);

        if (section1.interviewId !== numberIds.interviewId) {
            return {
                redirect: {
                    destination: generatePath(Paths.SECTION, {
                        interviewId: section1.interviewId,
                        sectionId: section1.id,
                    }),
                },
            };
        }

        await handleAccessChecks(() => accessChecks.section.readOne(session, section1));

        await ssg.sections.getById.fetch({ sectionId: numberIds.sectionId });
    },
});

const SectionPage = ({ numberIds }: InferServerSideProps<typeof getServerSideProps>) => {
    const sectionQuery = useSection(numberIds.sectionId);

    return <QueryResolver queries={[sectionQuery]}>{([section]) => <Section section={section} />}</QueryResolver>;
};

export default SectionPage;
