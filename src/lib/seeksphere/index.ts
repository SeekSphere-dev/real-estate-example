import {SeekSphereClient} from 'seeksphere-sdk';
import {db} from "@/lib/db";
import { sql } from 'drizzle-orm'

// Initialize the client
const client = new SeekSphereClient({
    apiKey: 'your-org-id', // Your organization ID from SeekSphere dashboard
    timeout: 30000 // optional, defaults to 30 seconds
});

const callSeeksphere = async (query: string) => {
    const searchResponse =  await client.search({query}, 'sql_only')
    if (!searchResponse.success && searchResponse.mode !== 'sql_only' && !searchResponse.sql) {
        return null
    }
    return searchResponse.sql;
}

export const search = async (query: string) => {
    const sqlResponse = await callSeeksphere(query);
    if (sqlResponse) {
        return db.execute(sql`${sqlResponse}`);
    }
}
