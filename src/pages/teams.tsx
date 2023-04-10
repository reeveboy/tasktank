import {
  faCircleChevronRight,
  faPlusCircle,
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
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("unauthenticated");
      router.push("/");
    },
  });

  const { handleSubmit, register, reset } = useForm();

  const utils = api.useContext();

  const [showInviteModal, setShowInviteModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  const userTeams = api.team.getAll.useQuery();
  const teamMembers = api.team.getTeamMembers.useQuery({
    id: selectedTeam?.id,
  });
  const sendInviteMutation = api.invite.sendInvite.useMutation();
  const getChats = api.message.getChats.useQuery({
    recieverId: selectedMember?.id,
  });
  const sendDMMutation = api.message.sendDM.useMutation();
  const updateStatusMutation = api.message.updateStatus.useMutation();

  const messageref = useRef<HTMLFormElement | null>(null);

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

  if (!session) return null;

  return (
    <>
      <Head>
        <title>Teams</title>
      </Head>
      <Layout session={session} route="Teams">
        <div className="grid h-full grid-cols-3">
          <div className="border">
            {userTeams.data?.length ? (
              userTeams.data.map((team) => (
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
            <Modal show={showInviteModal}>
              <div className="flex flex-col p-8">
                <p className="text-center text-lg font-semibold">
                  Invite members
                </p>
                <p className="p-2"></p>
                <form onSubmit={handleSubmit(submitInvite)}>
                  <input
                    {...register("emailTo")}
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3"
                    type="email"
                    required
                    minLength={3}
                    placeholder="enter email address"
                  />
                  <p className="p-2"></p>
                  <div className="flex justify-around">
                    <button
                      className=" rounded-lg bg-starynight px-20 py-2 font-semibold text-neutral"
                      type="submit"
                    >
                      Submit
                    </button>
                    <button
                      className="rounded-lg bg-watermelon px-20 py-2 font-semibold text-neutral"
                      onClick={() => setShowInviteModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </Modal>
            {selectedTeam ? (
              <>
                <div
                  onClick={() => setShowInviteModal(true)}
                  className={classNames(
                    "flex w-full cursor-pointer border px-4 py-3 transition-all hover:bg-sky-blue",
                    "bg-neutral"
                  )}
                >
                  <span className="text-md grow text-dark">Invite members</span>
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    className="text-2xl text-dark"
                  />
                </div>
                {teamMembers.data?.length
                  ? teamMembers.data.map((member) => (
                      <div
                        onClick={() => setSelectedMember(member)}
                        className={classNames(
                          "flex w-full cursor-pointer items-center border px-4 py-2 transition-all hover:bg-sky-blue",
                          selectedMember?.id === member.id
                            ? "bg-sky-blue"
                            : "bg-neutral"
                        )}
                      >
                        <img
                          className="h-8 w-8 rounded-full"
                          src={member.image ? member.image : ""}
                        />
                        <p className="p-2"></p>
                        <span className="text-md grow text-dark">
                          {member.name}{" "}
                          {member.id === session.user.id ? "(You)" : ""}
                        </span>
                        <FontAwesomeIcon
                          icon={faCircleChevronRight}
                          className="text-2xl text-dark"
                        />
                      </div>
                    ))
                  : null}
              </>
            ) : null}
          </div>
          <div className="border">
            {selectedMember ? (
              <div className="flex h-full flex-col">
                <div className="flex w-full items-center justify-between bg-starynight py-4 px-6">
                  <div className="flex">
                    <svg
                      className="w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" />
                    </svg>
                    <p className="p-2"></p>
                    <div className="font-semibold">{selectedMember.name}</div>
                  </div>
                  <svg
                    className="w-5 cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                  >
                    <path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z" />
                  </svg>
                </div>

                <div className="grid h-full w-full content-between overflow-y-hidden bg-[#CAEBF2] p-4 pb-6 ">
                  <div className=" container grid overflow-y-auto">
                    {getChats.data &&
                      getChats.data.map((chat) => (
                        <div
                          className={classNames(
                            chat.senderId === session.user.id
                              ? "ml-16 justify-self-end"
                              : "mr-16 justify-self-start"
                          )}
                        >
                          <div className="flex w-fit rounded-b-lg rounded-r-lg bg-[#0D253A] py-1 pl-3 pr-2 text-slate-200">
                            {chat.message}
                            <div className="flex place-self-end pl-2 pb-0.5 text-xs text-cyan-200">
                              {chat.time.toISOString().slice(11, 16)}
                              {chat.status == "read" ? (
                                <svg
                                  className="w-3 fill-cyan-200"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 512 512"
                                >
                                  <path d="M374.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 178.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l80 80c12.5 12.5 32.8 12.5 45.3 0l160-160zm96 128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 402.7 86.6 297.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l256-256z" />
                                </svg>
                              ) : (
                                <div></div>
                              )}
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
                      className="flex w-full items-center rounded-md bg-[#0D253A] px-4 py-2 pr-9 text-white"
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
      </Layout>
    </>
  );
};

export default Teams;
