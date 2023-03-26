import { faSquare } from "@fortawesome/free-regular-svg-icons";
import {
  faPenToSquare,
  faPlay,
  faSquareCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Project } from "@prisma/client";
import { log } from "console";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Layout from "~/Components/Layout";

import { useForm } from "react-hook-form";

import { api } from "~/utils/api";
import { getToday } from "~/utils/getToday";

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const { register, handleSubmit, reset } = useForm();

  let d = new Date();
  const [date, setDate] = useState(getToday(d));

  const utils = api.useContext();

  const projects = api.project.getUserProjects.useQuery();
  const tasks = api.task.getDaysTasks.useQuery({ date: date });

  const taskMutation = api.task.create.useMutation();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    switch (name) {
      case "project":
        setSelectedProject(
          projects.data?.find((project) => project.id == value) ?? null
        );
        break;
      case "date":
        setDate(new Date(e.target.value));
        utils.task.getDaysTasks.invalidate();
        break;
      default:
        break;
    }
  };

  const createTask = (d: any) => {
    if (!selectedProject) return;

    taskMutation.mutate(
      {
        name: d.taskName,
        projectId: selectedProject?.id,
        date: date,
      },
      {
        onSuccess: () => {
          utils.task.getDaysTasks.invalidate();

          reset();
          setSelectedProject(null);
        },
      }
    );
  };

  if (!session) return null;

  return (
    <>
      <Head>
        <title>Tracker</title>
      </Head>
      <Layout session={session} route="Tracker">
        <div className="flex flex-col p-8">
          <div className="grid w-full place-items-center">
            <input
              className="rounded-lg bg-dark px-8 py-2 font-semibold text-neutral"
              type="date"
              name="date"
              value={date.toISOString().substring(0, 10)}
              onChange={handleChange}
            />
          </div>
          <hr />
          <div className="relative mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 ">
              <thead className="bg-dark font-medium text-neutral ">
                <tr>
                  <th scope="col" className="rounded-l-lg px-6 py-3">
                    Task
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Time Elapsed
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Team
                  </th>
                  <th scope="col" className="rounded-r-lg px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.data?.length ? (
                  tasks.data?.map((task) => (
                    <tr className="border bg-neutral text-dark">
                      <th
                        scope="row"
                        className="whitespace-nowrap px-6 py-4 font-medium  "
                      >
                        {task.name}
                      </th>
                      <td className="px-6 py-4">{task.timeElapsed}</td>
                      <td className="px-6 py-4">{task.project.name}</td>
                      <td className="px-6 py-4">{task.project.team.name}</td>
                      <td className="px-6 py-4">
                        <button className="text-lg">
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button className="ml-4 text-lg">
                          {1 == 1 ? (
                            <FontAwesomeIcon icon={faSquare} />
                          ) : (
                            <FontAwesomeIcon icon={faSquareCheck} />
                          )}
                        </button>
                        <button className="ml-4 text-lg">
                          <FontAwesomeIcon icon={faPlay} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border bg-neutral text-dark">
                    <th
                      scope="row"
                      className="whitespace-nowrap px-6 py-4 font-medium  "
                    >
                      No tasks for today..
                    </th>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <hr />
          <div className="grid w-full place-items-center">
            <form
              onSubmit={handleSubmit(createTask)}
              className="mt-4 flex w-1/2 flex-col items-center p-4"
            >
              <div className="w-full">
                <p className="text-center text-lg font-semibold">Add Task</p>
              </div>
              <p className="p-2"></p>
              <div className="w-full">
                <input
                  {...register("taskName")}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3"
                  type="text"
                  minLength={3}
                />
              </div>
              <p className="p-2"></p>
              <div className="grid w-full grid-cols-1 gap-4">
                <select
                  className="block rounded-md border border-gray-300 bg-white py-2 px-3"
                  name="project"
                  onChange={handleChange}
                >
                  <option value="">Select Project</option>
                  {projects.data?.map((project) => (
                    <option value={project.id}>
                      <div className="flex w-full justify-between">
                        <span>{project.name} - </span>
                        <span>{project.team.name}</span>
                      </div>
                    </option>
                  ))}
                </select>
                {/* <select
                className="block rounded-md border border-gray-300 bg-white py-2 px-3"
                name="team"
                disabled
                value={selectedProject?.teamId}
              >
                <option>{selectedProject?.team.name}</option>
              </select> */}
              </div>
              <p className="p-2"></p>
              <div>
                <button
                  className="rounded-lg bg-starynight px-20 py-2 font-semibold text-neutral"
                  type="submit"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;
