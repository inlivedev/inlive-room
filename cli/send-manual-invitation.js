// MAILER_API_KEY=xxxx MAILER_DOMAIN=mail.inlive.app NEXT_PUBLIC_APP_ORIGIN=https://event.inlive.app npx tsx cli/send-manual-invitation.js gagah.ghaniswara.k@gmail.com
import { SendEventManualInvitationEmail } from "../app/(server)/_shared/mailer/mailer";

const email = process.argv[2]; // Get the email from the CLI arguments

if (!email) {
    console.error("Please provide an email address.");
    process.exit(1);
}

SendEventManualInvitationEmail(email);