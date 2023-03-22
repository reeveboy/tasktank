import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
<<<<<<< HEAD
import { useEffect } from "react";

import Layout from "~/Components/Layout";

import { api } from "~/utils/api";
=======
>>>>>>> parent of aabbab8 (more routers)

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("unauthenticated");
      router.push("/");
    },
  });

<<<<<<< HEAD
  // const { data } = api.team.getAll.useQuery();
  // const { mutate, error } = api.team.create.useMutation();

  // const createTeam = () => {
  //   mutate(
  //     { name: "Test" },
  //     {
  //       onSettled: (res) => {
  //         console.log(res);
  //       },
  //     }
  //   );
  // };
  if (!session) return null;

  return (
    <div>
      <Layout session={session} route="Tracker">
        hello
      </Layout>
=======
  return (
    <div>
      <h1>Dashboard</h1>
>>>>>>> parent of aabbab8 (more routers)
    </div>
  );
};

export default Dashboard;
