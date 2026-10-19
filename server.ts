import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiServiceRouter } from './ai_service/router.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Health route at /health and /api/health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'fullstack-express-vite', port: PORT });
});

// Mount citizen platform ai_service router
app.use('/api/ai_service', aiServiceRouter);

if (!isProduction && process.env.VERCEL !== '1') {
  // Mount Vite dev server in middleware mode locally
  (async () => {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  })();
} else {
  // Production static serving (لـ Vercel أو الإنتاج)
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

// التشغيل محلياً فقط إذا لم نكن على Vercel
if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[منصة المواطن الهجينة] الخادم يعمل على http://0.0.0.0:${PORT}`);
  });
}

// تصدير التطبيق ليعمل على Vercel Serverless
export default app;
