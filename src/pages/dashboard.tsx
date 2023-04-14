import { faSquare } from "@fortawesome/free-regular-svg-icons";
import {
  faPause,
  faPenToSquare,
  faPlay,
  faSquareCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Prisma, Project, Task } from "@prisma/client";
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
import classNames from "classnames";
import { Modal } from "flowbite-react";
import { useStopwatch } from "react-timer-hook";
import { formatTime } from "~/utils/formatTime";
import MyStopwatch from "~/Components/Stopwatch";

type TaskWithProjects = Prisma.TaskGetPayload<{
  include: {
    project: {
      include: {
        team: true;
      };
    };
  };
}>;

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

  // Queries
  const projects = api.project.getUserProjects.useQuery();
  const tasks = api.task.getDaysTasks.useQuery({ date: date });

  // Mutations
  const taskMutation = api.task.create.useMutation();
  const updateTaskMutation = api.task.update.useMutation();
  const updateTimeMutation = api.task.updateTime.useMutation();

  // Modal Handlers
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Seleted Task & Active Task States
  const [selectedTask, setSelectedTask] = useState<TaskWithProjects | null>(
    null
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    reset: resetWatch,
  } = useStopwatch({ autoStart: false });

  // Button Handlers
  const selectDate = (e: any) => {
    setDate(new Date(e.target.value));
    utils.task.getDaysTasks.invalidate();
  };

  const selectTask = (task: any) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const closeAddTaskModal = () => {
    setShowAddTaskModal(false);
    reset();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    reset();
    setSelectedTask(null);
  };

  const handleStartActiveTask = (task: Task) => {
    if (task.competed) return;

    setActiveTask(task);

    const stopwatchOffset = new Date();
    stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + task.timeElapsed);

    resetWatch(stopwatchOffset);
  };

  const handleStopActiveTask = () => {
    if (!activeTask) return;

    pause();
    const time = hours * 60 * 60 + minutes * 60 + seconds;
    updateTimeMutation.mutate(
      {
        id: activeTask?.id,
        time: time,
      },
      {
        onSuccess: () => {
          utils.task.getDaysTasks.invalidate();
          setActiveTask(null);
        },
      }
    );
  };

  // Form handlers
  const createTask = (d: any) => {
    if (!d.project || !d.taskName) return;

    taskMutation.mutate(
      {
        name: d.taskName,
        projectId: d.project,
        date: date,
      },
      {
        onSuccess: () => {
          utils.task.getDaysTasks.invalidate();

          setShowAddTaskModal(false);
          reset();
        },
      }
    );
  };

  const updateTask = (d: any) => {
    if (!selectedTask) return;

    updateTaskMutation.mutate(
      {
        id: selectedTask.id,
        name: d.newTaskName ? d.newTaskName : selectedTask.name,
        projectId: d.newProject ? d.newProject : selectedTask.projectId,
        timeElapsed: d.newTimeElapsed
          ? parseInt(d.newTimeElapsed)
          : selectedTask.timeElapsed,
        complete: selectedTask.competed,
      },
      {
        onSuccess: () => {
          utils.task.getDaysTasks.invalidate();

          setShowEditModal(false);
          reset();
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
        <div className="flex flex-col items-center p-8">
          <div className="flex">
            <input
              className="rounded-lg bg-dark px-8 py-2 text-sm font-semibold text-neutral"
              type="date"
              value={date.toISOString().substring(0, 10)}
              onChange={selectDate}
            />
            <p className="p-2"></p>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="rounded-lg bg-starynight px-3 py-2 text-sm text-neutral"
            >
              Add task
            </button>
          </div>
          <div className="mt-4 flex w-full items-center rounded-md border bg-starynight/40 py-4 px-3 text-sm">
            <div className="grow">
              {activeTask ? activeTask?.name : "No task running.."}
            </div>
            <p className="p-2"></p>
            <div>
              {activeTask ? (
                <div className="flex items-center">
                  <div>
                    <span>{hours.toString().padStart(2, "0")}</span>:
                    <span>{minutes.toString().padStart(2, "0")}</span>:
                    <span>{seconds.toString().padStart(2, "0")}</span>
                  </div>
                  <p className="p-1"></p>
                  <button
                    onClick={handleStopActiveTask}
                    className="rounded-lg bg-watermelon px-6 py-2 text-neutral"
                  >
                    Stop
                  </button>
                </div>
              ) : (
                <button className="rounded-lg bg-starynight px-6 py-2 text-neutral">
                  Start a task
                </button>
              )}
            </div>
          </div>
          <div className="relative mt-4 w-full overflow-x-auto">
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
                    <tr
                      className={
                        (classNames("border bg-neutral text-dark"),
                        task.competed ? "line-through" : "")
                      }
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap px-6 py-4  font-medium"
                      >
                        {task.name}
                      </th>
                      <td className="px-6 py-4">
                        {formatTime(task.timeElapsed)}
                      </td>
                      <td className="px-6 py-4">{task.project.name}</td>
                      <td className="px-6 py-4">{task.project.team.name}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => selectTask(task)}
                          className="text-lg"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>

                        <button className="ml-4 text-lg">
                          {activeTask?.id === task.id ? (
                            <FontAwesomeIcon
                              onClick={handleStopActiveTask}
                              icon={faPause}
                            />
                          ) : (
                            <FontAwesomeIcon
                              onClick={() => handleStartActiveTask(task)}
                              icon={faPlay}
                            />
                          )}
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
          <div className="grid w-full place-items-center"></div>
        </div>
        <Modal show={showEditModal}>
          <div className="flex flex-col p-8">
            <p className="text-center text-lg font-semibold">Edit Task</p>
            <p className="p-2"></p>
            <form onSubmit={handleSubmit(updateTask)}>
              <div className="w-full">
                <input
                  {...register("newTaskName")}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3"
                  type="text"
                  minLength={3}
                  placeholder={selectedTask?.name}
                />
                <p className="p-2"></p>
                <input
                  {...register("newTimeElapsed")}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3"
                  type="number"
                  minLength={3}
                  placeholder={selectedTask?.timeElapsed.toLocaleString()}
                />
                <p className="p-2"></p>
                <select
                  className="block rounded-md border border-gray-300 bg-white py-2 px-3"
                  {...register("newProject")}
                  // onChange={handleChange}
                >
                  {projects.data?.map((project) => (
                    <option
                      selected={project.id == selectedTask?.projectId}
                      value={project.id}
                    >
                      <div className="flex w-full justify-between">
                        <span>{project.name} - </span>
                        <span>{project.team.name}</span>
                      </div>
                    </option>
                  ))}
                </select>
                <p className="p-2"></p>
                <div className="flex items-center">
                  <input
                    checked={selectedTask?.competed}
                    type="checkbox"
                    onChange={() =>
                      // @ts-ignore
                      setSelectedTask((prev) => ({
                        ...prev,
                        competed: !selectedTask?.competed,
                      }))
                    }
                  />
                  <p className="p-1"></p>
                  <label>Complete</label>
                </div>
                <p className="p-2"></p>
                <div className="flex justify-between">
                  <button
                    className=" rounded-lg bg-starynight px-20 py-2 font-semibold text-neutral"
                    type="submit"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-watermelon px-20 py-2 font-semibold text-neutral"
                    onClick={closeEditModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Modal>

        <Modal show={showAddTaskModal}>
          <div className="flex flex-col p-8">
            <p className="text-center text-lg font-semibold">Add Task</p>
            <p className="p-2"></p>
            <form onSubmit={handleSubmit(createTask)}>
              <div className="w-full">
                <input
                  {...register("taskName")}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3"
                  type="text"
                  minLength={3}
                  placeholder="enter task name"
                />
              </div>
              <p className="p-2"></p>
              <select
                className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3"
                {...register("project")}
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
              <p className="p-2"></p>
              <div className="flex justify-between">
                <button
                  className=" rounded-lg bg-starynight px-20 py-2 font-semibold text-neutral"
                  type="submit"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-watermelon px-20 py-2 font-semibold text-neutral"
                  onClick={closeAddTaskModal}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </Layout>
    </>
  );
};

export default Dashboard;
