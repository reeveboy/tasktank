import sendgrid from "@sendgrid/mail";
import { env } from "~/env.mjs";

sendgrid.setApiKey(env.SENDGRID_API_KEY);

interface IEmailParams {
  inviteId: string;
  to: string;
  from: string;
}

const sendInviteMail = async (emailParams: IEmailParams) => {
  const url = `http://localhost:3000/invite/${emailParams.inviteId}`;

  const email = {
    to: emailParams.to,
    from: emailParams.from,
    subject: "Tanktank Team Invite",
    html: `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html lang="en">
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      <div class="img-container" style="display: flex;justify-content: center;align-items: center;border-radius: 5px;overflow: hidden; font-family: 'helvetica', 'ui-sans';">
        <a href="${url}">View Invitation</a>
      </div>
    </body>
    </html>
    `,
  };

  try {
    await sendgrid.send(email);
  } catch (error) {
    throw new Error("Email could not be sent, Please try again later");
  }
};

export { sendInviteMail };
