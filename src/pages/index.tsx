import { GetServerSidePropsContext } from 'next';

import { Paths } from '../utils/paths';

export async function getServerSideProps(_context: GetServerSidePropsContext) {
    return { redirect: { destination: Paths.PROBLEMS } };
}

export default function HomePage() {
    return null;
}
