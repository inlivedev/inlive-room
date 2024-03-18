

// MAILER_API_KEY=xxx MAILER_DOMAIN=mail.inlive.app ROOM_INV_EMAIL_TEMPLATE=inlive-room-event-invitation ENABLE_MAILER=true NEXT_PUBLIC_APP_ORIGIN=https://event.inlive.app npx tsx cli/send-ical.js participant@example.com published|rescheduled|cancelled
import {SendEventInvitationEmail} from '../app/(server)/_shared/mailer/mailer';
// af778b4b-f8fd5564
async function send(apiKey, email,status) {


	// selectParticipant dummy
	const participant = {
		id: 1,
		clientId: "testid",
		createdAt: new Date(),
		firstName: "John",
		lastName: "Doe",
		email: email,
	}

	let sequence = 1;
	if (status === 'rescheduled') {
		sequence = 2;
	} else if (status === 'cancelled') {
		sequence = 3;
	}

	const event = {
		id: 1,
		uuid: "123e4567-e89b-12d3-a456-426614174000",
		slug: "test-event",
		name: "Test Event",
		startTime: new Date(),
		endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
		createdAt: new Date(),
		updatedAt: new Date(),
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh. Etiam non elit dui. Nullam vel eros sit amet arcu vestibulum accumsan in in leo.",
		createdBy: 1,
		roomId: "123e4567",
		status: status,
		update_count: sequence,
	}

	host = {
		id: 1,
		firstName: "John",
		lastName: "Doe",
		email: "host@event.inlive.app"
	}

	await SendEventInvitationEmail(participant,event,host)
}

const args = process.argv.slice(2)

if (args.length < 2) {
	console.error("Usage: npx tsx cli/send-ical.js <email> <status>")
	process.exit(1)
}

send(args[0],args[1],args[2]).then(() => {
	console.log("Email sent")
}).catch((err) => {
	console.error(err)
})