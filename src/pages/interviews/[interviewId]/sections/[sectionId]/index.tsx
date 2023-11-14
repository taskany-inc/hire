import { Section } from '../../../../../components/Section/Section';
import { sectionMethods } from '../../../../../modules/sectionMethods';
import { InferServerSideProps } from '../../../../../utils/types';
import { accessChecks } from '../../../../../modules/accessChecks';
import { useSection } from '../../../../../modules/sectionHooks';
import { QueryResolver } from '../../../../../components/QueryResolver/QueryResolver';
import { createGetServerSideProps } from '../../../../../utils/createGetSSRProps';
import { Paths, generatePath } from '../../../../../utils/paths';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { interviewId: true, sectionId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        const section1 = await sectionMethods.getById(numberIds.sectionId);

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
