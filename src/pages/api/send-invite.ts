import sendgrid from "@sendgrid/mail";
import { NextApiRequest, NextApiResponse } from "next";

import { env } from "~/env.mjs";
import { sendInviteMail } from "~/utils/sendInviteMail";

sendgrid.setApiKey(env.SENDGRID_API_KEY);

async function sendInviteEmail(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Only post request allowed" });
  }
  try {
    const { to, from, inviteId } = req.body;

    const data = {
      to,
      from,
      inviteId,
    };

    sendInviteMail(data);

    return res.status(200).json({ message: "Invite Email Sent Successfully" });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ message: errorMessage });
  }
}

export default sendInviteEmail;
