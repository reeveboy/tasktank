import {
  faCircleChevronRight,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Team } from "@prisma/client";
import classNames from "classnames";
import { Modal } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
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

  const [showInviteModal, setShowInviteModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const userTeams = api.team.getAll.useQuery();
  const teamMembers = api.team.getTeamMembers.useQuery({
    id: selectedTeam?.id,
  });
  const sendInviteMutation = api.invite.sendInvite.useMutation();

  const submitInvite = (d: any) => {
    console.log(d);
    sendInviteMutation.mutate({
      email: d.emailTo,
      teamId: selectedTeam?.id,
    });
    setShowInviteModal(false);
    reset();
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
                        // onClick={() => setSelectedTeam(team)}
                        className={classNames(
                          "flex w-full cursor-pointer items-center border px-4 py-2 transition-all hover:bg-sky-blue"
                          // selectedTeam?.id === me.id ? "bg-sky-blue" : "bg-neutral"
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
          <div className="border"></div>
        </div>
      </Layout>
    </>
  );
};

export default Teams;
