import connectDB from './configs/db.config.js';
import app from './app.js';
import dotenv from 'dotenv';
import { createServer } from 'http';
import initialSocket from './socket/index.js';

dotenv.config();

const DB = process.env.DATABASE_LOCAL;
const DB_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT;

connectDB(DB_URL);

const server = createServer(app);

initialSocket(server);

server.listen(PORT, () => {
  console.log(`The server is listening at ${PORT}...`);
});
