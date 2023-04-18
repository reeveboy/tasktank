import {
  faCircleChevronRight,
  faPenToSquare,
  faPlusCircle,
  faTrash,
  faVideoCamera,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Team, User } from "@prisma/client";
import classNames from "classnames";
import { Modal } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import Layout from "~/Components/Layout";
import { api } from "~/utils/api";

const Teams: NextPage = () => {
  const { data: session } = useSession();

  const { handleSubmit, register, reset } = useForm();

  const utils = api.useContext();

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  const userTeams = api.team.getAll.useQuery();
  const teamMembers = api.team.getTeamMembers.useQuery({
    id: selectedTeam?.id,
  });

  const getChats = api.message.getChats.useQuery({
    recieverId: selectedMember?.id,
  });

  const teamMutation = api.team.create.useMutation();
  const sendInviteMutation = api.invite.sendInvite.useMutation();
  const sendDMMutation = api.message.sendDM.useMutation();

  const teamUpdate = api.team.update.useMutation();
  const teamDelete = api.team.delete.useMutation();
  const teamRemoveMember = api.team.removeMember.useMutation();

  const messageref = useRef<HTMLFormElement | null>(null);

  const selectTeam = (team: Team) => {
    setSelectedTeam(team);
    setSelectedMember(null);
  };

  const editTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowEditTeamModal(true);
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

  const updateTeam = (d: any) => {
    console.log(d);
    if (!d.newTeamName || !selectedTeam) return;

    teamUpdate.mutate(
      {
        id: selectedTeam.id,
        name: d.newTeamName,
      },
      {
        onSuccess: () => {
          utils.team.getAll.invalidate();
        },
      }
    );
    setShowEditTeamModal(false);
  };

  const deleteTeam = () => {
    if (!selectedTeam) return;

    teamDelete.mutate(
      {
        id: selectedTeam.id,
      },
      {
        onSuccess: () => {
          utils.team.getAll.invalidate();
        },
      }
    );
    setShowEditTeamModal(false);
    setSelectedTeam(null);
  };

  const removeMember = (memberId: string) => {
    if (!selectedTeam || !memberId) return;

    teamRemoveMember.mutate(
      {
        memberId: memberId,
        teamId: selectedTeam.id,
      },
      {
        onSuccess: () => {
          utils.team.getTeamMembers.invalidate();
        },
      }
    );
  };

  const submitInvite = (d: any) => {
    console.log(d);
    sendInviteMutation.mutate({
      email: d.emailTo,
      teamId: selectedTeam?.id,
    });
    setShowInviteModal(false);
    reset();
  };

  const sendMessage = (d: any) => {
    sendDMMutation.mutate(
      {
        recieverId: selectedMember?.id,
        message: d.message,
      },
      {
        onSettled: () => {
          utils.message.getChats.invalidate();
        },
      }
    );
    reset();
    messageref.current?.reset();
  };

  return (
    <>
      <Head>
        <title>Teams</title>
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
            {userTeams.data?.length ? (
              userTeams.data.map((team) => (
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
                    {team.ownerId === session?.user.id && (
                      <FontAwesomeIcon
                        onClick={() => editTeam(team)}
                        icon={faPenToSquare}
                        className="text-xl text-dark transition-all hover:scale-105"
                      />
                    )}
                    <p className="p-1"></p>
                    <FontAwesomeIcon
                      onClick={() => selectTeam(team)}
                      icon={faCircleChevronRight}
                      className="text-xl text-dark transition-all hover:scale-105"
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
                  Members
                </div>
                <p className="p-1"></p>
                <div
                  onClick={() => setShowInviteModal(true)}
                  className="flex w-full cursor-pointer items-center rounded-md bg-white/50  px-3 py-2 shadow-md transition-all hover:scale-[1.01]"
                >
                  <span className="grow text-sm font-medium text-dark">
                    Invite members
                  </span>
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    className="text-2xl text-dark"
                  />
                </div>
                <p className="p-2"></p>
                {teamMembers.data?.members.length
                  ? teamMembers.data.members.map((member) => (
                      <>
                        <div
                          onClick={() => setSelectedMember(member.user)}
                          className={classNames(
                            "flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-gray-700 shadow-sm transition-all hover:scale-[1.01]",
                            selectedMember?.id === member.user.id
                              ? "bg-sky-blue"
                              : "bg-white/50"
                          )}
                        >
                          <img
                            className="h-8 w-8 rounded-full"
                            src={member.user.image ? member.user.image : ""}
                          />
                          <p className="p-2"></p>
                          <span className="grow text-sm text-dark">
                            {member.user.name}{" "}
                            {member.user.id === session?.user.id ? "(You)" : ""}
                          </span>
                          <FontAwesomeIcon
                            icon={faCircleChevronRight}
                            className="text-2xl text-dark"
                          />
                        </div>
                        <p className="p-1"></p>
                      </>
                    ))
                  : null}
              </div>
            ) : null}
          </div>
          <div className="p-2">
            {selectedMember ? (
              <div className="flex h-full flex-col">
                <div className="flex w-full items-center justify-between rounded-t-lg bg-starynight/70 py-4 px-6">
                  <div className="flex">
                    <div className="font-medium text-neutral">
                      {selectedMember.name}
                    </div>
                  </div>
                  <FontAwesomeIcon
                    className="text-xl text-dark"
                    icon={faVideoCamera}
                  />
                </div>

                <div className="grid h-full w-full content-between overflow-y-hidden bg-white/50 p-4 pb-6 ">
                  <div className=" container grid overflow-y-auto">
                    {getChats.data &&
                      getChats.data.map((chat) => (
                        <div
                          className={classNames(
                            chat.senderId === session?.user.id
                              ? "ml-16 justify-self-end"
                              : "mr-16 justify-self-start"
                          )}
                        >
                          <div className="flex w-fit rounded-b-lg rounded-r-lg bg-[#0D253A] py-1 pl-3 pr-2 text-sm text-slate-200">
                            {chat.message}
                            <div className="flex place-self-end pl-2 pb-0.5 text-xs text-cyan-200">
                              {chat.time.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                                hourCycle: "h23",
                              })}
                            </div>
                          </div>
                          <p className="p-1"></p>
                        </div>
                      ))}
                  </div>

                  <form
                    onSubmit={handleSubmit(sendMessage)}
                    ref={messageref}
                    className="relative grid w-full "
                  >
                    <input
                      {...register("message")}
                      placeholder="message..."
                      className="flex w-full items-center rounded-md bg-[#0D253A] px-4 py-2 pr-9 text-sm text-neutral"
                    ></input>
                    <button
                      type="submit"
                      className="absolute mr-1 self-center justify-self-end bg-[#0D253A] p-2"
                    >
                      <svg
                        className="right-0 w-4 fill-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
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
                  className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm shadow"
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

        <Modal show={showEditTeamModal}>
          <div className="flex flex-col px-8 py-6">
            <p className="text-xl font-semibold text-dark">Edit Team</p>
            <p className="p-2"></p>
            <form onSubmit={handleSubmit(updateTeam)}>
              <div>
                <span className="text-xs">Team Name</span>
                <input
                  {...register("newTeamName")}
                  className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm shadow"
                  type="text"
                  minLength={3}
                  placeholder={selectedTeam?.name}
                />
              </div>

              <p className="p-2"></p>

              <div>
                <span className="text-xs">Members</span>
                {teamMembers.data?.members?.map((member) => (
                  <>
                    <div className="flex w-full items-center rounded-md bg-gray-300 px-3 py-2 text-gray-700 shadow-sm">
                      <span className="text-xs">{member.user.name}</span>
                      {session?.user.id !== member.userId && (
                        <FontAwesomeIcon
                          onClick={() => removeMember(member.userId)}
                          icon={faTrash}
                          className="ml-auto cursor-pointer text-lg text-dark transition-all hover:scale-105"
                        />
                      )}
                    </div>
                    <p className="p-1"></p>
                  </>
                ))}
              </div>

              <p className="p-2"></p>
              <div className="grid w-full grid-cols-3 gap-2">
                <button
                  className="w-full rounded-lg bg-starynight py-2 text-sm font-light text-neutral"
                  type="submit"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg bg-dark py-2 text-sm font-light text-neutral"
                  onClick={deleteTeam}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg bg-red-500 py-2 text-sm font-light text-neutral"
                  onClick={() => setShowEditTeamModal(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal show={showInviteModal}>
          <div className="flex flex-col px-8 py-6">
            <p className="text-lg font-semibold text-dark">Invite members</p>
            <p className="p-2"></p>
            <form onSubmit={handleSubmit(submitInvite)}>
              <div>
                <span className="text-xs">Email Address</span>
                <input
                  {...register("emailTo")}
                  className="w-full rounded border border-gray-500 px-3 py-2 pr-9 text-sm shadow"
                  type="email"
                  required
                  minLength={3}
                  placeholder="Enter email address"
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
                  onClick={() => setShowInviteModal(false)}
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

export default Teams;
