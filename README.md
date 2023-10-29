## ENV Variables

- `MONGO_URL` is necessary
- `AUTHENTICATION_HOST` and `AUTHENTICATION_PORT` when other services depends on this service, copy the `authentication.ts` file, and set this env variable, default `localhost` and `8081`
