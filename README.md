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
6. Properly leave from the room by clicking the hang up icon.

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
