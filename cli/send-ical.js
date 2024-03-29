// MAILER_API_KEY=xxxx MAILER_DOMAIN=mail.inlive.app ROOM_INV_EMAIL_TEMPLATE=inlive-room-event-invitation ROOM_RESCHED_EMAIL_TEMPLATE=inlive-room-event-rescheduled ROOM_CANCEL_EMAIL_TEMPLATE=inlive-room-event-cancelled ENABLE_MAILER=true NEXT_PUBLIC_APP_ORIGIN=https://event.inlive.app npx tsx cli/send-ical.js tyohan@inlive.app published // published|rescheduled|cancelled
import {SendEventCancelledEmail, SendEventInvitationEmail, SendEventRescheduledEmail} from '../app/(server)/_shared/mailer/mailer';

async function send(email,status) {
	
	let sequence = 1;
	if (status === 'rescheduled') {
		sequence = 2;
	} else if (status === 'cancelled') {
		sequence = 3;
	}

	// selectParticipant dummy
	const participant = {
		id: 1,
		clientId: "testid",
		createdAt: new Date(),
		firstName: "John",
		lastName: "Doe",
		email: email,
		updateCount : sequence
	}

	console.log("Sequence : ",sequence)

	const event = {
		id: 1,
		uuid: "123e4567-e89b-12d3-a456-426614174009",
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
	}

	host = {
		id: 1,
		name: "John Doe",
		email: "host@event.inlive.app"
	}

	if (status === 'rescheduled') {
		await SendEventRescheduledEmail(participant,event,event,host)
	} else if (status === 'cancelled') {
		await SendEventCancelledEmail(participant,event,host)
	} else {
		await SendEventInvitationEmail(participant,event,host)
	}

	
}

const args = process.argv.slice(2)

if (args.length < 2) {
	console.error("Usage: npx tsx cli/send-ical.js <email> <status>")
	process.exit(1)
}

console.log("Using API key ",process.env.MAILER_API_KEY)
console.log("Sending email to",args[0])
console.log("Status",args[1])

send(args[0],args[1]).then(() => {
	console.log("Email sent")
}).catch((err) => {
	console.error(err)
})