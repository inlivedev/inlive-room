# inLive Room
This is a project built mainly using [Next.js](https://nextjs.org/) and [inLive Hub API](https://inlive.app/realtime-interactive/). This project gives example and demonstration of developing a conference room website using inLive Hub API.

## Getting Started

### Running the Project Locally

**Clone this repository**

Clone this repository to your local machine using [git](https://git-scm.com).
```bash
git clone https://github.com/inlivedev/inlive-room.git
cd inlive-room
```

**Setting the environment variables**

Copy all the variables to `.env.local`
```bash
cp .env.local.example .env.local
```

**Install the dependencies**

Install the dependencies using package managers such as [npm](https://www.npmjs.com/package/@inlivedev/inlive-js-sdk), [yarn](https://yarnpkg.com/package/@inlivedev/inlive-js-sdk), or [pnpm](https://pnpm.io).
```bash
npm install
# or
yarn install
```

**Start the local development server**

Run `dev` command to start the local development server in http://localhost:3000

```bash
npm run dev
# or
yarn dev
```

**Build the project**

Run `build` command to build the project
```bash
npm run build
# or
yarn build
```

### Running with Docker

You need to install [docker](https://docs.docker.com/get-docker/) in your local machine.

**Build image**
```
docker build -t inlive-room:latest .
```

You can view your images with `docker images`.

**Run image**
```
docker run -p 3000:3000 inlive-room:latest
```

Navigate to the local development server in http://localhost:3000
