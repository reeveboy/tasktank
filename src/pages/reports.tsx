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
    title: {
      display: true,
      text: "Time Completed this week",
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

  // const chartData = api.project.getProjectChartData.useQuery();
  const chardata = api.task.getChartData.useQuery();

  console.log(chardata.data);

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

  console.log(data);

  if (!session || chardata.isLoading) return null;

  return (
    <>
      <Head>
        <title>Reports</title>
      </Head>
      <Layout session={session} route="Reports">
        <Bar options={options} data={data} />
      </Layout>
    </>
  );
};

export default Reports;
