import { NextPage } from "next";
import Head from "next/head";

import Layout from "~/Components/Layout";
import { Modal } from "flowbite-react";

import { api } from "~/utils/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleChevronRight,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";

import { useForm } from "react-hook-form";
import classNames from "classnames";
import { Team, Project as ProjectType, Prisma } from "@prisma/client";
import { formatTime } from "~/utils/formatTime";
import { getTodayString } from "~/utils/getToday";
import { useSession } from "next-auth/react";

type TaskWithUsers = Prisma.TaskGetPayload<{
  include: {
    user: true;
  };
}>;

const Project: NextPage = () => {
  const { data: session } = useSession();

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const [selectedTeam, setSelectedTeam] = useState<Team>();
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<TaskWithUsers | null>(null);

  const teams = api.team.getAll.useQuery();
  const projects = api.project.getTeamProjects.useQuery({
    teamId: selectedTeam?.id,
  });
  const tasks = api.task.getProjectTasks.useQuery({
    projectId: selectedProject?.id,
  });
  const userProjects = api.project.getUserProjects.useQuery();
  const teamMembers = api.team.getTeamMembers.useQuery({
    id: selectedTeam?.id,
  });

  const teamMutation = api.team.create.useMutation();
  const projectMutation = api.project.create.useMutation();
  const taskMutation = api.task.create.useMutation();

  const utils = api.useContext();

  const selectTeam = (team: Team) => {
    setSelectedTeam(team);
    setSelectedProject(null);
    setSelectedTask(null);
  };

  const selectProject = (project: ProjectType) => {
    setSelectedProject(project);
    setSelectedTask(null);
  };

  const selectTask = (task: TaskWithUsers) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const createTeam = (d: any) => {
    teamMutation.mutate(
      { name: d.teamName },
      {
        onSuccess: () => {
          utils.team.getAll.invalidate();

          reset();
        },
      }
    );
    setShowTeamModal(false);
  };

  const createProject = (d: any) => {
    projectMutation.mutate(
      { name: d.projectName, teamId: selectedTeam?.id },
      {
        onSuccess: () => {
          utils.project.getTeamProjects.invalidate({
            teamId: selectedTeam?.id,
          });

          reset();
        },
      }
    );
    setShowProjectModal(false);
  };

  const createTask = (d: any) => {
    if (!d.project || !d.taskName || !d.date) return;

    if (selectedTeam?.ownerId !== session?.user.id) return;

    taskMutation.mutate(
      {
        name: d.taskName,
        projectId: d.project,
        date: new Date(d.date),
        userId: d.member,
      },
      {
        onSuccess: () => {
          utils.task.getProjectTasks.invalidate();

          setShowAddTaskModal(false);

          reset();
        },
      }
    );
  };

  return (
    <>
      <Head>
        <title>Projects</title>
      </Head>
      <Layout>
        <div className="grid h-full grid-cols-3 p-4">
          <div className="p-2">
            <div className="rounded bg-dark p-1 text-center text-sm text-neutral shadow-sm">
              Teams
            </div>
            <p className="p-1"></p>
            <div
              onClick={() => setShowTeamModal(true)}
              className="flex w-full cursor-pointer items-center rounded-md bg-white/50  px-3 py-2 shadow-md transition-all hover:scale-[1.01]"
            >
              <span className="grow text-sm font-medium text-dark">
                Create a team
              </span>
              <FontAwesomeIcon
                icon={faPlusCircle}
                className="text-2xl text-dark"
              />
            </div>
            <p className="p-2"></p>
            {teams.data?.length ? (
              teams.data.map((team) => (
                <>
                  <div
                    onClick={() => selectTeam(team)}
                    className={classNames(
                      "flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-gray-700 shadow-sm transition-all hover:scale-[1.01]",
                      selectedTeam?.id === team.id
                        ? "bg-sky-blue"
                        : "bg-white/50"
                    )}
                  >
                    <span className="grow text-sm capitalize text-dark">
                      {team.name}{" "}
                      {team.ownerId === session?.user.id ? "(Owner)" : ""}
                    </span>
                    <FontAwesomeIcon
                      icon={faCircleChevronRight}
                      className="text-2xl text-dark"
                    />
                  </div>
                  <p className="p-1"></p>
                </>
              ))
            ) : (
              <div className="flex w-full cursor-pointer rounded-md bg-white/50  px-3 py-2 shadow-sm transition-all hover:scale-[1.01]">
                <span className="grow text-sm font-light text-dark">
                  No teams...
                </span>
              </div>
            )}
          </div>
          <div className="p-2">
            {selectedTeam ? (
              <div>
                <div className="rounded bg-dark p-1 text-center text-sm text-neutral shadow-sm">
                  Projects
                </div>
                <p className="p-1"></p>
                <div
                  onClick={() => setShowProjectModal(true)}
                  className="flex w-full cursor-pointer items-center rounded-md bg-white/50  px-3 py-2 shadow-md transition-all hover:scale-[1.01]"
                >
                  <span className="grow text-sm font-medium text-dark">
                    Create a Project
                  </span>
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    className="text-2xl text-dark"
                  />
                </div>
                <p className="p-2"></p>
                {projects.data?.length ? (
                  projects.data.map((project) => (
                    <>
                      <div
                        onClick={() => selectProject(project)}
                        className={classNames(
                          "flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-gray-700 shadow-sm transition-all hover:scale-[1.01]",
                          selectedProject?.id === project.id
                            ? "bg-sky-blue"
                            : "bg-white/50"
                        )}
                      >
                        <span className="grow text-sm capitalize text-dark">
                          {project.name}
                        </span>
                        <FontAwesomeIcon
                          icon={faCircleChevronRight}
                          className="text-2xl text-dark"
                        />
                      </div>
                      <p className="p-1"></p>
                    </>
                  ))
                ) : (
                  <div className="flex w-full cursor-pointer rounded-md bg-white/50  px-3 py-2 shadow-sm transition-all hover:scale-[1.01]">
                    <span className="grow text-sm font-light text-dark">
                      No Projects...
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          {selectedProject ? (
            <div className="p-2">
              <div className="rounded bg-dark p-1 text-center text-sm text-neutral shadow-sm">
                Tasks
              </div>
              <p className="p-1"></p>
              <div
                onClick={() => setShowAddTaskModal(true)}
                className="flex w-full cursor-pointer items-center rounded-md bg-white/50  px-3 py-2 shadow-md transition-all hover:scale-[1.01]"
              >
                <span className="grow text-sm font-medium text-dark">
                  Create a task
                </span>
                <FontAwesomeIcon
                  icon={faPlusCircle}
                  className="text-2xl text-dark"
                />
              </div>
              <p className="p-2"></p>
              <div>
                {tasks.data?.length ? (
                  tasks.data.map((task) => (
                    <>
                      <div
                        onClick={() => selectTask(task)}
                        className={classNames(
                          "flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-700 shadow-sm transition-all hover:scale-[1.01]",
                          task.competed ? "line-through" : "",
                          selectedTask?.id === task.id
                            ? "bg-sky-blue"
                            : "bg-white/50"
                        )}
                      >
                        <span className="grow capitalize">{task.name}</span>
                        <span>{task.user.name}</span>
                      </div>
                      <p className="p-1"></p>
                    </>
                  ))
                ) : (
                  <div className="flex w-full cursor-pointer rounded-md bg-white/50  px-3 py-2 shadow-sm transition-all hover:scale-[1.01]">
                    <span className="grow text-sm font-light text-dark">
                      No tasks...
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <Modal show={showTeamModal} className="rounded-lg">
          <div className="flex flex-col px-8 py-6">
            <h1 className="text-xl font-semibold text-dark">Create a team</h1>
            <p className="p-2"></p>
            <form onSubmit={handleSubmit(createTeam)}>
              <div>
                <span className="text-xs">Team Name</span>
                <input
                  {...register("teamName")}
                  type="text"
                  className="w-full rounded border border-gray-500 px-3 py-2 text-sm shadow"
                  required
                  placeholder="Enter team name"
                  minLength={3}
                />
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
                  onClick={() => setShowTeamModal(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal show={showProjectModal} className="rounded-lg">
          <div className="flex flex-col px-8 py-6">
            <h1 className="text-xl font-bold text-dark">Create a project</h1>
            <p className="p-2"></p>
            <form onSubmit={handleSubmit(createProject)}>
              <div>
                <span className="text-xs">Project Name</span>
                <input
                  {...register("projectName")}
                  type="text"
                  className="w-full rounded border border-gray-500 px-3 py-2 text-sm shadow"
                  required
                  placeholder="Enter project name"
                  minLength={3}
                />
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
                  onClick={() => setShowProjectModal(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal show={showTaskModal} className="rounded-lg">
          <div className="flex flex-col px-8 py-6">
            <h1 className="text-xl font-bold text-dark">Task Info</h1>
            <p className="p-2"></p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs">Task Name</span>
                <p className="rounded-md border px-3 py-2 text-sm capitalize text-gray-700 shadow-md">
                  {selectedTask?.name}
                </p>
              </div>
              <div>
                <span className="text-xs">Date</span>
                <p className="rounded-md px-3 py-2 text-sm capitalize text-gray-700 shadow-md">
                  {selectedTask?.date.toDateString()}
                </p>
              </div>
              <div>
                <span className="text-xs">Project Name</span>
                <p className="rounded-md px-3 py-2 text-sm capitalize text-gray-700 shadow-md">
                  {selectedProject?.name}
                </p>
              </div>
              <div>
                <span className="text-xs">Team Name</span>
                <p className="rounded-md px-3 py-2 text-sm capitalize text-gray-700 shadow-md">
                  {selectedTeam?.name}
                </p>
              </div>
              <div>
                <span className="text-xs">Member Name</span>
                <p className="rounded-md px-3 py-2 text-sm capitalize text-gray-700 shadow-md">
                  {selectedTask?.user.name}
                </p>
              </div>
              <div>
                <span className="text-xs">Time Elapsed</span>
                <p className="rounded-md px-3 py-2 text-sm capitalize text-gray-700 shadow-md">
                  {formatTime(selectedTask?.timeElapsed ?? 0)}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-xs">Completed</span>
                <p className="rounded-md px-3 py-2 text-sm capitalize text-gray-700 shadow-md">
                  {selectedTask?.competed ? "true" : "false"}
                </p>
              </div>
            </div>
            <p className="p-2"></p>
            <button
              type="button"
              className="w-full rounded-lg bg-red-500 py-2 text-sm font-light text-neutral"
              onClick={closeTaskModal}
            >
              Close
            </button>
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
                  className="w-full rounded border border-gray-500 px-3 py-2 text-sm shadow"
                  type="text"
                  minLength={3}
                  placeholder="Enter Task Name"
                  required
                />
              </div>
              <p className="p-2"></p>
              <div>
                <span className="text-xs">Date</span>
                <input
                  {...register("date")}
                  className="w-full rounded border border-gray-500 px-3 py-2 text-sm"
                  type="date"
                  min={getTodayString(new Date())}
                  required
                />
              </div>
              <p className="p-2"></p>
              <div>
                <span className="text-xs">Project {"->"} Team</span>
                <select
                  className="w-full rounded border border-gray-500 px-3 py-2 text-sm shadow"
                  {...register("project")}
                >
                  <option value="">Select Project</option>
                  {userProjects.data?.map((project) => (
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
              {selectedTeam?.ownerId === session?.user.id && (
                <>
                  <p className="p-2"></p>
                  <div>
                    <span className="text-xs">Assign task to</span>
                    <select
                      className="w-full rounded border border-gray-500 px-3 py-2 text-sm shadow"
                      {...register("member")}
                    >
                      <option value="">Select Member</option>
                      {teamMembers.data?.members.map((member) => (
                        <option value={member.user.id}>
                          <div className="flex w-full justify-between">
                            <span>{member.user.name}</span>
                          </div>
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
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
                  onClick={() => setShowAddTaskModal(false)}
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

export default Project;
