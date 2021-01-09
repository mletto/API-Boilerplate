import { cleanEnv, str, port, host, num } from 'envalid';
   
  const env = cleanEnv(
    process.env,
    {
        SERVER_HOST: host({ default: 'localhost' }),
        SERVER_PORT: port({ default: 5000, desc: 'The port to start the server on'}),
        DB_USER: str(),
        DB_PASSWORD: str(),
        DB_HOST: host({ default: 'localhost' }),
        DB_DATABASE: str(),
        DB_PORT: port({ default: 27017})
    },
    { strict: true }
  )

export default env

  