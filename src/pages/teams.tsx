import { faCircleChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Team } from "@prisma/client";
import classNames from "classnames";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

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

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const userTeams = api.team.getAll.useQuery();

  const teamMembers = api.team.getTeamMembers.useQuery({
    id: selectedTeam?.id,
  });

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
            {selectedTeam && teamMembers.data
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
          </div>
          <div className="border"></div>
        </div>
      </Layout>
    </>
  );
};

export default Teams;
