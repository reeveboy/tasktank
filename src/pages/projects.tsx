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
  const [selectedProject, setSelectedProject] = useState<ProjectType>();

  const tasks = api.task.getProjectTasks.useQuery({
    projectId: selectedProject?.id,
  });

  const utils = api.useContext();

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
        <Modal show={showTeamModal} className="rounded-lg">
          <div className="flex w-full flex-col rounded-lg bg-neutral p-12">
            <form onSubmit={handleSubmit(createTeam)} className="flex flex-col">
              <h1 className="text-xl font-bold text-dark">Create a team</h1>
              <div className="mt-2 flex w-full items-baseline">
                <input
                  {...register("teamName")}
                  type="text"
                  className="text-md grow rounded-lg border border-carbon bg-neutral py-4 px-4"
                  required
                  placeholder="Enter team name"
                  minLength={3}
                />
                <button type="submit" className="ml-2">
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    className="text-4xl text-dark"
                  />
                </button>
              </div>
            </form>

            <div className="mt-4">
              <button
                onClick={() => setShowTeamModal(false)}
                className="rounded-lg bg-red-500 px-4 py-2 text-neutral"
              >
                close
              </button>
            </div>
          </div>
        </Modal>
        <div className="grid h-full grid-cols-3">
          <div className="border">
            <div
              onClick={() => setShowTeamModal(true)}
              className="flex w-full cursor-pointer border bg-neutral  px-4 py-3 transition-all hover:bg-sky-blue"
            >
              <span className="grow text-lg font-semibold text-dark">
                Create a team
              </span>
              <FontAwesomeIcon
                icon={faPlusCircle}
                className="text-2xl text-dark"
              />
            </div>
            {teams.data?.length ? (
              teams.data.map((team) => (
                <div
                  onClick={() => setSelectedTeam(team)}
                  className={classNames(
                    "flex w-full cursor-pointer border px-4 py-3 transition-all hover:bg-sky-blue",
                    selectedTeam?.id === team.id ? "bg-sky-blue" : "bg-neutral"
                  )}
                >
                  <span className="text-md grow text-dark">{team.name}</span>
                  <FontAwesomeIcon
                    icon={faCircleChevronRight}
                    className="text-2xl text-dark"
                  />
                </div>
              ))
            ) : (
              <div className="flex w-full border bg-neutral px-4 py-3 transition-all hover:bg-sky-blue">
                <span className="grow text-lg font-light text-dark">
                  No teams...
                </span>
              </div>
            )}
          </div>
          <div className="border">
            {selectedTeam ? (
              <div>
                <Modal show={showProjectModal} className="rounded-lg">
                  <div className="flex w-full flex-col rounded-lg bg-neutral p-12">
                    <form
                      onSubmit={handleSubmit(createProject)}
                      className="flex flex-col"
                    >
                      <h1 className="text-xl font-bold text-dark">
                        Create a project
                      </h1>
                      <div className="mt-2 flex w-full items-baseline">
                        <input
                          {...register("projectName")}
                          type="text"
                          className="grow rounded-lg border border-carbon bg-neutral py-4 px-4 text-sm"
                          required
                          placeholder="Enter project name"
                          minLength={3}
                        />
                        <button type="submit" className="ml-2">
                          <FontAwesomeIcon
                            icon={faPlusCircle}
                            className="text-4xl text-dark"
                          />
                        </button>
                      </div>
                    </form>

                    <div className="mt-4">
                      <button
                        onClick={() => setShowProjectModal(false)}
                        className="rounded-lg bg-red-500 px-4 py-2 text-neutral"
                      >
                        close
                      </button>
                    </div>
                  </div>
                </Modal>
                <div
                  onClick={() => setShowProjectModal(true)}
                  className="flex w-full cursor-pointer border bg-neutral px-4 py-3 transition-all hover:bg-sky-blue"
                >
                  <span className="grow text-lg font-semibold text-dark">
                    Create a Project
                  </span>
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    className="text-2xl text-dark"
                  />
                </div>
                {projects.data?.length ? (
                  projects.data.map((project) => (
                    <div
                      onClick={() => setSelectedProject(project)}
                      className={classNames(
                        "flex w-full cursor-pointer border px-4 py-3 transition-all hover:bg-sky-blue",
                        selectedProject?.id === project.id
                          ? "bg-sky-blue"
                          : "bg-neutral"
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
                  ))
                ) : (
                  <div className="flex w-full border bg-neutral p-4 transition-all hover:bg-sky-blue">
                    <span className="grow text-lg font-light text-dark">
                      No Projects...
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          {selectedProject ? (
            <div className="border">
              <div>
                {tasks.data?.length ? (
                  tasks.data.map((task) => (
                    <div className="flex w-full border px-4 py-3 transition-all">
                      <span className="text-md grow text-dark">
                        {task.name}
                      </span>
                      <span>{task.user.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex w-full border px-4 py-3 transition-all">
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
      </Layout>
    </>
  );
};

export default Project;
