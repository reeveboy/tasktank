import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { api } from "~/utils/api";

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("unauthenticated");
      router.push("/");
    },
  });

  // const { data } = api.team.getAll.useQuery();
  const { mutate, error } = api.team.create.useMutation();

  const createTeam = () => {
    mutate(
      { name: "Test" },
      {
        onSettled: (res) => {
          console.log(res);
        },
      }
    );
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {/* <button onClick={createTeam}>Create Team</button> */}
    </div>
  );
};

export default Dashboard;
