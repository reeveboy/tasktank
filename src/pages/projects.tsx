import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

import Layout from "~/Components/Layout";
import { Modal } from "flowbite-react";

import { api } from "~/utils/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleChevronRight,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import classNames from "classnames";
import { Team, Project as ProjectType } from "@prisma/client";

const Project: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("unauthenticated");
      router.push("/");
    },
  });

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const { register, handleSubmit } = useForm();

  const teams = api.team.getAll.useQuery();
  const teamMutation = api.team.create.useMutation();
  const [selectedTeam, setSelectedTeam] = useState<Team>();

  const projects = api.project.getTeamProjects.useQuery({
    teamId: selectedTeam?.id,
  });
  const projectMutation = api.project.create.useMutation();
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null
  );

  const tasks = api.task.getProjectTasks.useQuery({
    projectId: selectedProject?.id,
  });

  const utils = api.useContext();

  const selectTeam = (team: Team) => {
    setSelectedTeam(team);
    setSelectedProject(null);
  };

  const createTeam = (d: any) => {
    teamMutation.mutate(
      { name: d.teamName },
      {
        onSuccess: () => {
          utils.team.getAll.invalidate();
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
        },
      }
    );
    setShowProjectModal(false);
  };

  if (!session) return null;

  return (
    <>
      <Head>
        <title>Projects</title>
      </Head>
      <Layout session={session} route="Projects">
        <div className="grid h-full grid-cols-3 p-4">
          <div className="p-2">
            <div
              onClick={() => setShowTeamModal(true)}
              className="flex w-full cursor-pointer rounded-md bg-white/50  px-3 py-2 shadow-md transition-all hover:scale-[1.01]"
            >
              <span className="text-md grow font-medium text-dark">
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
                      "flex w-full cursor-pointer rounded-md px-3 py-2 text-gray-700 shadow-sm transition-all hover:scale-[1.01]",
                      selectedTeam?.id === team.id
                        ? "bg-sky-blue"
                        : "bg-white/50"
                    )}
                  >
                    <span className="text-md grow text-dark">{team.name}</span>
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
                <span className="text-md grow font-light text-dark">
                  No teams...
                </span>
              </div>
            )}
          </div>
          <div className="p-2">
            {selectedTeam ? (
              <div>
                <div
                  onClick={() => setShowProjectModal(true)}
                  className="flex w-full cursor-pointer rounded-md bg-white/50  px-3 py-2 shadow-md transition-all hover:scale-[1.01]"
                >
                  <span className="text-md grow font-medium text-dark">
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
                        onClick={() => setSelectedProject(project)}
                        className={classNames(
                          "flex w-full cursor-pointer rounded-md px-3 py-2 text-gray-700 shadow-sm transition-all hover:scale-[1.01]",
                          selectedProject?.id === project.id
                            ? "bg-sky-blue"
                            : "bg-white/50"
                        )}
                      >
                        <span className="text-md grow text-dark">
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
                    <span className="text-md grow font-light text-dark">
                      No Projects...
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          {selectedProject ? (
            <div className="border p-2">
              <div>
                {tasks.data?.length ? (
                  tasks.data.map((task) => (
                    <>
                      <div
                        className={classNames(
                          "flex w-full cursor-pointer rounded-md bg-white/50 px-3 py-2 text-sm text-gray-700 shadow-sm transition-all hover:scale-[1.01]",
                          task.competed ? "line-through" : ""
                        )}
                      >
                        <span className="text-md grow">{task.name}</span>
                        <span>{task.user.name}</span>
                      </div>
                      <p className="p-1"></p>
                    </>
                  ))
                ) : (
                  <div className="flex w-full cursor-pointer rounded-md bg-white/50  px-3 py-2 shadow-sm transition-all hover:scale-[1.01]">
                    <span className="text-md grow font-light text-dark">
                      No tasks...
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border" />
          )}
        </div>

        <Modal show={showTeamModal} className="rounded-lg">
          <div className="flex flex-col px-8 py-6">
            <h1 className="text-xl font-semibold text-dark">Create a team</h1>
            <p className="p-2"></p>
            <form onSubmit={handleSubmit(createTeam)}>
              <input
                {...register("teamName")}
                type="text"
                className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm shadow"
                required
                placeholder="Enter team name"
                minLength={3}
              />
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
              <input
                {...register("projectName")}
                type="text"
                className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm shadow"
                required
                placeholder="Enter project name"
                minLength={3}
              />
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
      </Layout>
    </>
  );
};

export default Project;
