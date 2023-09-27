> [!NOTE]
> This project is still in early development and currently only used for demonstration purposes. You may find many noticeable bugs when using it.

# inLive Room

This project gives an example and demonstration of developing a conference room website using [Next.js](https://nextjs.org/) and [inLive Hub API](https://inlive.app/realtime-interactive/). To build a similar project using Hub API, you can start exploring the [inLive Hub API docs](https://inlive.app/docs/getting-started/using-hub-api/).

## How to use the live website
1. Visit the inLive Room at https://room.inlive.app.
2. Create a new room by clicking the "Create a new room" button.
3. When prompted, give camera and microphone permission access so the website can start sending the user video camera and audio microphone to the server.
4. Copy the room URL on the address bar and share the URL to others.
5. Others can join to the room by using the room URL or using the room unique code in the URL.
6. Properly leave from the room by clicking the hang up button.

## Getting started with this project

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

- First create your schema definition in `(server)/_features/<feature_name>/schema.ts`, make sure to export it
- Add the schema into export list in `(server)/_schema/index.ts` this is important, so that drizzle can discover the schema to be used for the [Query Feature](https://orm.drizzle.team/docs/rqb)
- Now you can also generate the database migration script by running the `npm run generate` command
- Due to the inability to customize generated migration script file name, please make sure to rename the script file and update the name in `_journal.json` inside the `./migration/meta` folder

>Currently a database versioning is not yet implemented, but you can generate database migration script from the schema that was created from Drizzle ORM

**Start the local development server**

Run `dev` script to start the local development server in http://localhost:3000

```bash
npm run dev
# or
yarn dev
```

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
