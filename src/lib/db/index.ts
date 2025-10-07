import { drizzle } from 'drizzle-orm/libsql';
import Env from '@/env';

// You can specify any property from the libsql connection options
const db = drizzle({ 
  connection: { 
    url: Env.TURSO_DATABASE_URL!, 
    authToken: Env.TURSO_AUTH_TOKEN!
  }
});

export { db };