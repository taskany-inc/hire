import { GetServerSidePropsContext } from 'next';

import { Paths } from '../utils/paths';

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const { locale } = context;

    return { redirect: { destination: `/${locale}${Paths.PROBLEMS}` } };
}

export default function HomePage() {
    return null;
}
