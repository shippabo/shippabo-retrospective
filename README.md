# Retrospective Runner

## Background

A retrospective is a feedback meeting our team runs at the end of the sprint. It involves a roundtable feedback sharing session in which the participants will one by one share their feedback for the past sprint. The goal of this app was to provide a tool that will allow the meeting host to randomize the current sharing order in a remote setting. In order to do this, the app must allow a meeting host to create a session and share the session link with their team. Once the team visits the link, they will be given the option to join the session and see other participants. When all participants have joined the session, the host may start the session and randomize the participant order.

## Getting Started

**Use Script to Build and Seed Data**

```
yarn workspace @app/server prisma db push
yarn workspace @app/server prisma db seed
```

**Restoring to Pristine Seed Data**

```
yarn workspace @app/server prisma migrate reset
```

**Start Frontend and Backend**

These command should be run in two separate shells

```
yarn start:server
yarn start:frontend
```

## Architecture

#### Server

The API server is based on a lightweight express app written in typescript. Data schemes are defined in [schema.prisma](server/prisma/schema.prisma) and models have typecript interface automatically generated from prisma. Currently, the models two main concerns include:

- Session, where the host (session creator) can start or stop the session
- User, representing the participants that have joined the session

Server directory structure is grouped by high level concerns include:

- [server/core](server/core) - Encompassing common concern or higher levels of abstractions
- [server/prisma](server/prisma) - Manages database concerns and provides database configs, seeding, and migrations
- [server/session](server/session) - `Session` domain with `SessionService` (business logic concerns) and `SessionRepository` (data persistence concerns)
- [server/user](server/user) - `User` domain with `UserService` (business logic concerns), and `UserRepository` (data persistence concerns)
- [server/app.ts](server/app.ts) - Main entry point for server bootstrap and configuration
- [server/routes.ts](server/routes.ts) - Configuration for application routing

#### Client

The client app is based in React and also written in typescript. It utilizes tailwindCSS for its styling framework, heroicons for its iconographic components, and headlessui for additional advanced UI interactions (such as pop up modals and CSS transitions). Additionally the app adheres to an open API scheme as defined in [schema.json](frontend/src/schema.json) and supported by the backend server.

Frontend directory structure is also grouped by Session or User concerns and includes the following major components:

- [SessionCreate.tsx](frontend/src/Session/SessionCreate.tsx) - Modal to create a session and main entry point of the app
- [SessionActive.tsx](frontend/src/Session/SessionActive.tsx) - Component for the main active session page
- [SessionJoin.tsx](frontend/src/Session/SessionJoin.tsx) - Modal to allow users to join a session
- [UserList.tsx](frontend/src/User/UserList.tsx) - Component for listing out participants in the session

Additionally there are generated API definitions in [schema.ts](frontend/src/schema.ts) that are utilized by a standardized server request interface managed in [api.ts](frontend/src/api.ts)
