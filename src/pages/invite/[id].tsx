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
          router.replace(`/teams`);
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
          router.replace(`/teams}`);
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
        <Layout>
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
      <Layout>
        <div className="grid h-full w-full place-items-center">
          <div className="w-full max-w-md rounded-lg border bg-white/50 p-4 shadow-md">
            <p className="text-md text-center">
              An Invitation from <b>{inviteData.data?.invitedBy.name}</b> <br />{" "}
              to join their team <b>{inviteData.data?.team.name}</b>
            </p>
            <p className="p-2"></p>
            <div className="grid w-full grid-cols-2 gap-2">
              <button
                onClick={accept}
                className="rounded-lg bg-starynight py-2 text-sm text-neutral shadow transition-all hover:bg-starynight/80"
              >
                Accept invite
              </button>
              <button
                onClick={decline}
                className="w-full rounded-lg bg-red-500 py-2 text-sm font-light text-neutral transition-all hover:bg-red-400"
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
