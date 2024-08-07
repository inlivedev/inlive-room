> [!NOTE]
> This project is still in early development and currently only used for demonstration purposes. You may find many noticeable bugs when using it.

# inLive Room
This project gives an example and demonstration of developing a conference room website using [Next.js](https://nextjs.org/) and [inLive Hub API](https://inlive.app/realtime-interactive/). To build a similar project using Hub API, you can start exploring the [inLive Hub API docs](https://inlive.app/docs/getting-started/using-hub-api/).

This project is the open source version of our full fledged web app hosted at [room.inlive.app](https://room.inlive.app), allowing you to create : 
* Instant Meeting
* Create Scheduled Meeting by inviting them by Email includes iCalendar Scheduling 
    * *Require Persistent Storage

Table of Contents :
    * [How to use the inLive Website](#how-to-use-the-live-website)
    * [Running the Project Locally](#running-the-project-locally)
    * [Development Notes](#development-notes)


## How to use the live website
1. Visit the inLive Room at https://room.inlive.app.
2. Create a new room by clicking the "Create a new room" button.
3. When prompted, give camera and microphone permission access so the website can start sending the user video camera and audio microphone to the server.
4. Copy the room URL on the address bar and share the URL to others.
5. Others can join to the room by using the room URL or using the room unique code in the URL.
6. Properly leave from the room by clicking the hang up button.

## Development

### Running the Project Locally

**Clone this repository**

Clone this repository to your local machine using [git](https://git-scm.com).
```bash
git clone https://github.com/inlivedev/inlive-room.git
cd inlive-room
```

**Setting the environment variables**

Copy all the variables from `.env.local.example` to `.env.local`
```bash
cp .env.local.example .env.local
```

*Make sure to set `PERSISTANT_DATA` variable to `false` if you want to run the project without using database

**Install the dependencies**

Install the dependencies using package managers such as [npm](https://npmjs.com), [yarn](https://yarnpkg.com), or [pnpm](https://pnpm.io).
```bash
npm install
# or
yarn install
```

**Database Setup**

We're using Postgres as our Database Server, make sure to have the server running on your machine, you can also use our docker compose to start the server quickly

create a `.env` containg these variables : 

```
DB_USER = inlive_room_user
DB_PASS = inlive_room_pass
DB_HOST = localhost
DB_PORT = 5432
DB_NAME = inliveroom
```
then start the postgres server by running 
```
docker compose up -d
```

Run the Migrations

```
npm run migrate
```

After finished developing make sure to shutdown the server by running 
```
docker compose down
```
or you can turn shut it down from the docker dashboard

**Adding Models to The Database**

> You may skip this step if you only intend to use the Instant Meeting Feature

- First create your schema definition in `(server)/_features/<feature_name>/schema.ts`, make sure to export it
- Add the schema into export list in `(server)/_schema/index.ts` this is important, so that drizzle can discover the schema to be used for the [Query Feature](https://orm.drizzle.team/docs/rqb)
- Now make sure to generate the initial database migration script by running the `npm run db:generate --name <MigrationName>` command
- During development make sure to generate the migration script again after adding changes, table to the schema file


>Currently a database versioning is not yet implemented, but you can generate database migration script from the schema that was created from Drizzle ORM

>Under the hood the we're using drizzle to generate the database migration and as our ORM, make sure to read [Drizzle Documentation](https://orm.drizzle.team/kit-docs/commands) for options.

**Start the local development server**


Run `dev` script to start the local development server in http://localhost:3000

```bash
npm run dev
# or
yarn dev
```


>ℹ️ The `dev` script run nextjs with custom-server on top of express with a limited hot reload capability to host the static files, you might only need to run the nextjs server by using `dev:next`.

**Build the project**

Run `build` script to build the project
```bash
npm run build
# or
yarn build
```

### Running with Docker

You need to install [docker](https://docs.docker.com/get-docker/) in your local machine.

**Build the image**
```
docker build -t inlive-room:latest .
```

You can view your images with `docker images`.

**Run the image**
```
docker run -p 3000:3000 inlive-room:latest
```

Navigate to the local development server in http://localhost:3000


## Development Notes
* [Changes to Events Participant Schema](https://github.com/inlivedev/inlive-room/pull/241)


---
This project is tested with BrowserStack