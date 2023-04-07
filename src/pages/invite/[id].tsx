import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { string } from "zod";
import Layout from "~/Components/Layout";
import { api } from "~/utils/api";

const Invite: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const inviteId = router.query.id as string;

  const inviteData = api.invite.getInvite.useQuery({ inviteId });
  const acceptInvite = api.invite.acceptInvite.useMutation();
  const declineInvite = api.invite.declineInvite.useMutation();

  const accept = () => {
    acceptInvite.mutate(
      { inviteId },
      {
        onSuccess(data) {
          if (data === null) {
            return;
          }
          router.push(`/teams}`);
        },
      }
    );
  };

  const decline = () => {
    declineInvite.mutate(
      { inviteId },
      {
        onSuccess(data) {
          if (data === null) {
            return;
          }
          router.push(`/teams}`);
        },
      }
    );
  };

  if (status === "loading" || inviteData.status === "loading") {
    return <div>Loading...</div>;
  }

  if (inviteData.data === null) {
    return (
      <>
        <Head>
          <title>Invitation</title>
        </Head>
        <Layout session={session} route="Invitation">
          <span>Invite not found</span>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Invitation</title>
      </Head>
      <Layout session={session} route="Invitation">
        <div className="grid h-full w-full place-items-center">
          <div className="max-w-md rounded-lg bg-sky-blue p-4">
            <p className="text-lg">
              Invitation from <b>{inviteData.data?.invitedBy.name}</b> to join
              their team <b>{inviteData.data?.team.name}</b>
            </p>
            <p className="p-2"></p>
            <div className="flex w-full justify-around">
              <button
                onClick={accept}
                className="rounded-lg bg-emerald-400 px-3 py-3"
              >
                Accept invite
              </button>
              <button
                onClick={decline}
                className="rounded-lg bg-red-400 px-3 py-3"
              >
                Decline invite
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Invite;
