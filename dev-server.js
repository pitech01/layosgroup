import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env' }); 

const app = express();
app.use(express.json());

// ✅ Catch all incoming /api/ routes
app.all('/api/:path', async (req, res) => {
    try {
        // Fix the undefined issue by stripping "/api/" directly from the URL path
        const endpoint = req.path.replace(/^\/api\//, '');
        
        // Target your local .ts backend function file
        const modulePath = path.resolve(`./api/${endpoint}.ts`);
        
        console.log(`[Backend] Routing incoming request to: ${modulePath}`);

        // ✅ Use 'tsx' to intercept and dynamically run your TypeScript API file
        const { default: handler } = await import(`file://${modulePath}`);
        
        await handler(req, res);
    } catch (error) {
        console.error("❌ Local Backend Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('🚀 Local API running at http://localhost:3001');
});
