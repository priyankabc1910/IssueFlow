import 'dotenv/config';
import { app } from './app.js';
const port = Number(process.env.API_PORT || 4000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters');
app.listen(port, () => console.log(`IssueFlow API listening on http://localhost:${port}`));
