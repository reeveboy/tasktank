import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "~/Components/Layout";
import { api } from "~/utils/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

const Reports: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("unauthenticated");
      router.push("/");
    },
  });

  const chardata = api.task.getChartData.useQuery();

  const labels = chardata.data?.map((d) => d.date.toLocaleDateString());
  const data = {
    labels,
    datasets: [
      {
        label: "Total Time Elapsed per day",
        data: chardata.data?.map((d) => d._sum.timeElapsed),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  if (!session) return null;

  return (
    <>
      <Head>
        <title>Reports</title>
      </Head>
      <Layout session={session} route="Reports">
        <div className="flex flex-col p-4 text-lg font-semibold">
          <p className="text-center">Total time completed this week</p>
          <div className="grid scale-[0.8] place-items-center rounded-lg bg-white/50 px-2 py-4 shadow-lg">
            <Bar options={options} data={data} />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Reports;
