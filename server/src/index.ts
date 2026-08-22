/**
 * Server 主入口
 */

import express from 'express';
import { resolve } from 'node:path';
import { apiRouter } from './api/routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API 路由
app.use('/api', apiRouter);

// 静态项目输出目录
app.use('/projects', express.static(resolve(process.cwd(), 'projects')));

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 PPT Agent Pro Server running at http://localhost:${PORT}`);
  console.log(`📋 S0-S3 Industrial Full Pipeline Agent Ready`);
  console.log(`======================================================\n`);
});
