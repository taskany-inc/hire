import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
    return (
        <div>
            <Head>
                <title>Taskany Hire</title>
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main>
                <h1>Welcome to Tasksny Hire!</h1>
            </main>
        </div>
    );
};

export default Home;
