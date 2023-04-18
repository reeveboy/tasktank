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
  const chardata = api.task.getChartData.useQuery({ offset: 7 });

  const labels = chardata.data?.map((d) => d.date.toLocaleDateString());
  const data = {
    labels,
    datasets: [
      {
        label: "Time Completed in Hours",
        data: chardata.data?.map((d) =>
          d._sum.timeElapsed ? d._sum.timeElapsed / 60 / 60 : 0
        ),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Reports</title>
      </Head>
      <Layout>
        <div className="flex flex-col p-4 text-lg font-medium">
          <p className="text-center">
            Total time completed this week (in hours)
          </p>
          <div className="grid scale-[0.8] place-items-center rounded-lg bg-white/50 px-2 py-4 shadow-lg">
            <Bar options={options} data={data} />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Reports;
