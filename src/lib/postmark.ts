import { ServerClient } from 'postmark';

if (!process.env.POSTMARK_API_TOKEN) {
 throw new Error('POSTMARK_API_TOKEN environment variable is not set');
}

export const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN);
