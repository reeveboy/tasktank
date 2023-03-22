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
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const projects = api.project.getTeamProjects.useQuery({
    teamId: selectedTeam as string,
  });
  const projectMutation = api.project.create.useMutation();
  const [selectedProject, setSelectedProject] = useState<string>("");

  const tasks = api.task.getProjectTasks.useQuery({
    projectId: selectedProject as string,
  });

  const createTeam = (d: any) => {
    teamMutation.mutate({ name: d.name });
    setShowTeamModal(false);
    teams.refetch();
  };

  const createProject = (d: any) => {
    projectMutation.mutate({ name: d.name, teamId: selectedTeam });
    setShowProjectModal(false);
    projects.refetch();
  };

  const selectTeam = (id: string) => {
    setSelectedTeam(id);
    // projects.refetch();
  };

  const selectProject = (id: string) => {
    setSelectedProject(id);
    // projects.refetch();
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
                  {...register("name")}
                  type="text"
                  className="grow rounded-lg border border-carbon bg-neutral py-4 px-4 text-sm"
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
              className="flex w-full cursor-pointer border bg-neutral p-4 transition-all hover:bg-sky-blue"
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
                <TeamItem
                  team={team}
                  selectTeam={selectTeam}
                  selectedTeam={selectedTeam}
                />
              ))
            ) : (
              <div className="flex w-full border bg-neutral p-4 transition-all hover:bg-sky-blue">
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
                        Create a team
                      </h1>
                      <div className="mt-2 flex w-full items-baseline">
                        <input
                          {...register("name")}
                          type="text"
                          className="grow rounded-lg border border-carbon bg-neutral py-4 px-4 text-sm"
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
                  className="flex w-full cursor-pointer border bg-neutral p-4 transition-all hover:bg-sky-blue"
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
                    <ProjectItem
                      project={project}
                      selectProject={selectProject}
                      selectedProject={selectedProject}
                    />
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
            <div className="border bg-sky-blue">
              <div>
                {tasks.data?.length ? (
                  tasks.data.map((task) => <TaskItem task={task} />)
                ) : (
                  <div className="flex w-full border bg-sky-blue p-4 transition-all">
                    <span className="grow text-lg font-light text-dark">
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

const TeamItem: React.FC<any> = ({ team, selectTeam, selectedTeam }) => {
  const onclick = () => {
    selectTeam(team.id);
  };

  if (selectedTeam == team.id) {
    return (
      <div
        onClick={onclick}
        className="flex w-full border bg-sky-blue p-4 transition-all hover:bg-sky-blue"
      >
        <span className="grow text-lg font-semibold text-dark">
          {team.name}
        </span>
        <FontAwesomeIcon
          icon={faCircleChevronRight}
          className="text-2xl text-dark"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onclick}
      className="flex w-full border bg-neutral p-4 transition-all hover:bg-sky-blue"
    >
      <span className="grow text-lg font-semibold text-dark">{team.name}</span>
      <FontAwesomeIcon
        icon={faCircleChevronRight}
        className="text-2xl text-dark"
      />
    </div>
  );
};

const ProjectItem: React.FC<any> = ({
  project,
  selectProject,
  selectedProject,
}) => {
  const onclick = () => {
    selectProject(project.id);
  };

  if (selectedProject == project.id) {
    return (
      <div
        onClick={onclick}
        className="flex w-full border bg-sky-blue p-4 transition-all hover:bg-sky-blue"
      >
        <span className="grow text-lg font-semibold text-dark">
          {project.name}
        </span>
        <FontAwesomeIcon
          icon={faCircleChevronRight}
          className="text-2xl text-dark"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onclick}
      className="flex w-full border bg-neutral p-4 transition-all hover:bg-sky-blue"
    >
      <span className="grow text-lg font-semibold text-dark">
        {project.name}
      </span>
      <FontAwesomeIcon
        icon={faCircleChevronRight}
        className="text-2xl text-dark"
      />
    </div>
  );
};

const TaskItem: React.FC<any> = ({ task }) => {
  return (
    <div className="flex w-full border bg-sky-blue p-4 transition-all">
      <span className="grow text-lg font-semibold text-dark">{task.name}</span>
      <span>{task.user.name}</span>
    </div>
  );
};

export default Project;
