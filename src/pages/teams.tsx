import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

import Layout from "~/Components/Layout";

const Teams: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("unauthenticated");
      router.push("/");
    },
  });

  if (!session) return null;

  return (
    <>
      <Head>
        <title>Teams</title>
      </Head>
      <Layout session={session} route="Tracker">
        teams
      </Layout>
    </>
  );
};

export default Teams;
