// src/pages/api/intelligence/fetch.js
import { fetchIntelligence } from '../../../services/intelligenceService';
import { getLatestItems } from '../../../services/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // Trigger an update (in a real app, this should be a background job, not per-request)
            // But for demo, we fetch on first load or refresh.
            await fetchIntelligence();

            const items = getLatestItems(20);
            res.status(200).json({ success: true, data: items });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Failed to fetch intelligence' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
