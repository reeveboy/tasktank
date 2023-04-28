import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Home: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname == "/") {
      router.push("/tracker");
    }
  }, []);

  return (
    <>
      <Head>
        <title>Tasktank</title>
      </Head>
    </>
  );
};

export default Home;
