import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("unauthenticated");
      router.push("/");
    },
  });

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default Dashboard;
