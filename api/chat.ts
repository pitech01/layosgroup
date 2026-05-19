export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {
        const body =
            typeof req.body === 'string'
                ? JSON.parse(req.body)
                : req.body;


        if (!process.env.GITHUB_TOKEN) {
            return res.status(500).json({
                error: 'Missing GitHub token'
            });
        }

        const response = await fetch(
            'https://models.inference.ai.azure.com/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
                },
                body: JSON.stringify(body)
            }
        );

        const data = await response.json();

        return res.status(response.status).json(data);

    } catch (error: any) {
        console.error('Server AI Error:', error);

        return res.status(500).json({
            error: 'Internal server error'
        });
    }
}