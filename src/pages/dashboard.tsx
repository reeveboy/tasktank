import {
  faPause,
  faPenToSquare,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Prisma, Project, Task } from "@prisma/client";
import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

import Layout from "~/Components/Layout";

import { useForm } from "react-hook-form";

import { api } from "~/utils/api";
import { getToday } from "~/utils/getToday";
import classNames from "classnames";
import { Modal } from "flowbite-react";
import { useStopwatch } from "react-timer-hook";
import { formatTime, formatTime2, parseTime } from "~/utils/formatTime";

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

  const formatedTime = formatTime2(selectedTask?.timeElapsed);

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
    if (activeTask) handleStopActiveTask();

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

    const formatedTime = formatTime2(selectedTask.timeElapsed);
    if (d.newTimeElapsedHours) formatedTime[0] = d.newTimeElapsedHours;
    if (d.newTimeElapsedMinutes) formatedTime[1] = d.newTimeElapsedMinutes;
    if (d.newTimeElapsedSeconds) formatedTime[2] = d.newTimeElapsedSeconds;

    const finalTime = parseTime(
      `${formatedTime[0]}:${formatedTime[1]}:${formatedTime[2]}`
    );
    updateTaskMutation.mutate(
      {
        id: selectedTask.id,
        name: d.newTaskName ? d.newTaskName : selectedTask.name,
        projectId: d.newProject ? d.newProject : selectedTask.projectId,
        timeElapsed: finalTime,
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

  return (
    <>
      <Head>
        <title>Tracker</title>
      </Head>
      <Layout>
        <div className="flex flex-col items-center p-4">
          <div className="flex">
            <input
              className="cursor-pointer rounded-lg bg-dark px-8 py-2 text-sm text-neutral"
              type="date"
              value={date.toISOString().substring(0, 10)}
              onChange={selectDate}
            />
            <p className="p-2"></p>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="rounded-lg bg-starynight px-3 py-2 text-sm text-neutral hover:bg-starynight/80"
            >
              Add task
            </button>
          </div>
          <div className="mt-4 flex w-full items-center rounded-md border bg-white/50 py-4 px-3 text-sm shadow-sm">
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
                    className="rounded-lg bg-red-500 px-6 py-2 text-neutral"
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
            <table className="w-full text-left text-sm text-gray-500 shadow-lg">
              <thead className="bg-dark text-neutral ">
                <tr>
                  <td scope="col" className="rounded-tl-lg px-6 py-3">
                    Task
                  </td>
                  <td scope="col" className="px-6 py-3">
                    Time Elapsed
                  </td>
                  <td scope="col" className="px-6 py-3">
                    Project
                  </td>
                  <td scope="col" className="px-6 py-3">
                    Team
                  </td>
                  <td scope="col" className="rounded-tr-lg px-6 py-3"></td>
                </tr>
              </thead>
              <tbody>
                {tasks.data?.length ? (
                  tasks.data?.map((task) => (
                    <tr
                      className={classNames(
                        "border bg-white/50 capitalize text-dark",
                        task.competed ? "line-through" : ""
                      )}
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap px-6 py-4 font-medium"
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
          <div className="flex flex-col px-8 py-6">
            <p className="text-xl font-semibold text-dark">Edit Task</p>
            <p className="p-2"></p>
            <form onSubmit={handleSubmit(updateTask)}>
              <div className="w-full">
                <div>
                  <span className="text-xs">Task Name</span>
                  <input
                    {...register("newTaskName")}
                    className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm shadow"
                    type="text"
                    minLength={3}
                    placeholder={selectedTask?.name}
                  />
                </div>
                <p className="p-2"></p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-xs">Hours</span>
                    <input
                      {...register("newTimeElapsedHours")}
                      className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm shadow"
                      type="number"
                      placeholder={formatedTime[0]}
                    />
                  </div>
                  <div>
                    <span className="text-xs">Minutes</span>
                    <input
                      {...register("newTimeElapsedMinutes")}
                      className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm shadow"
                      type="number"
                      placeholder={formatedTime[1]}
                    />
                  </div>
                  <div>
                    <span className="text-xs">Seconds</span>
                    <input
                      {...register("newTimeElapsedSeconds")}
                      className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm shadow"
                      type="number"
                      placeholder={formatedTime[2]}
                    />
                  </div>
                </div>
                <p className="p-2"></p>
                <div>
                  <span className="text-xs">Project {"->"} Team</span>

                  <select
                    className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm capitalize shadow"
                    {...register("newProject")}
                  >
                    {projects.data?.map((project) => (
                      <option
                        selected={project.id == selectedTask?.projectId}
                        value={project.id}
                      >
                        <div className="flex w-full justify-between">
                          <span>
                            {project.name} {"->"}{" "}
                          </span>
                          <span>{project.team.name}</span>
                        </div>
                      </option>
                    ))}
                  </select>
                </div>
                <p className="p-2"></p>
                <div className="grid w-full place-items-center">
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
                    <label className="text-sm">Complete</label>
                  </div>
                </div>
                <p className="p-2"></p>
                <div className="grid w-full grid-cols-2 gap-2">
                  <button
                    className="w-full rounded-lg bg-starynight py-2 text-sm font-light text-neutral"
                    type="submit"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-lg bg-red-500 py-2 text-sm font-light text-neutral"
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
          <div className="flex flex-col px-8 py-6">
            <p className="text-xl font-semibold text-dark">Add Task</p>
            <p className="p-2"></p>
            <form onSubmit={handleSubmit(createTask)}>
              <div>
                <span className="text-xs">Task Name</span>
                <input
                  {...register("taskName")}
                  className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm shadow"
                  type="text"
                  minLength={3}
                  placeholder="Enter Task Name"
                />
              </div>
              <p className="p-2"></p>
              <div>
                <span className="text-xs">Project {"->"} Team</span>

                <select
                  className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm shadow"
                  {...register("project")}
                >
                  <option value="">Select Project</option>
                  {projects.data?.map((project) => (
                    <option value={project.id}>
                      <div className="flex w-full justify-between">
                        <span>
                          Project {project.name} {"->"}{" "}
                        </span>
                        <span>Team {project.team.name}</span>
                      </div>
                    </option>
                  ))}
                </select>
              </div>
              <p className="p-2"></p>
              <div className="grid w-full grid-cols-2 gap-2">
                <button
                  className="w-full rounded-lg bg-starynight  py-2 text-sm font-light text-neutral"
                  type="submit"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg bg-red-500  py-2 text-sm font-light text-neutral"
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
