import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { useRouter } from "next/router";


import Signin from "./Signin";
import Signup from "./Signup";

const Home: NextPage = () => {
  const router = useRouter();

  const { data: session, status } = useSession();

  // if (session) {
  //   router.push("/dashboard");
  // }

  const login = () => {
    signIn();
  };
  return (
    <>
      <Head>
        <title>Tasktank</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Signup/>
    </>
  );
};

export default Home;
