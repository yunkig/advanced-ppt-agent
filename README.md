<div align="center">

# 🐦⬛ PPT Agent Pro

### 智能演示文稿生成多智能体系统 (Multi-Agent PPT Generator)

[![Test Status](https://img.shields.io/badge/tests-5%20passed-success?style=flat-square&logo=vitest)](./server/test/full-pipeline.test.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-emerald?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=flat-square)](./LICENSE)

<p align="center">
  <a href="#-项目简介">项目简介</a> •
  <a href="#-核心特性">核心特性</a> •
  <a href="#-快速启动">快速启动</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-开源协议">开源协议</a>
</p>

</div>

---

## 🐦⬛ 项目简介

**PPT Agent Pro** 是一套基于多智能体（Multi-Agent）协同架构的自动化演示文稿生成系统。

系统通过将整套 PPT 生成任务拆解为需求对齐、大纲规划、模块化分布式生成与质量审查闭环，实现从自然语言 Prompt 到原生演示文稿（`.pptx`）的高质量全流程交付。

---

## 🐦⬛ 核心特性

- **🐦⬛ Multi-Agent 协同生成**：采用 Leader-Worker 分布式生成架构，页面级独立上下文，避免长文本风格漂移与信息遗忘。
- **🐦⬛ 需求自适应对齐与检索**：支持联网检索知识增强与主动澄清交互，精准捕捉用户核心诉求。
- **🐦⬛ 层次化大纲与模板系统**：提供结构化大纲规划与多套现代视觉配色模板，支持人机协同在线确认。
- **🐦⬛ 智能质检与自省修复**：内置 Review 审查机制，从内容表述、视觉排版等多维度核验并提供自动修复能力。
- **🐦⬛ 全链路流式响应**：基于 SSE 实现低延迟流式状态与日志同步，支持异常断线自动恢复。
- **🐦⬛ 现代化双端交互界面**：基于 Vue 3 + Tailwind CSS 构建，提供响应式视图与实时可视化看板。

---

## 🐦⬛ 快速启动

### 1. 环境准备
- **Node.js**: $\ge 20.0.0$
- **Python**: $\ge 3.9$ (可选，用于本地 PPTX 编译器支持：`pip3 install python-pptx`)

### 2. 安装依赖

```bash
npm install
```

### 3. 运行自动化测试

```bash
npm run test
```

### 4. 运行终端演示 (CLI Demo)

```bash
npm run demo
```

### 5. 启动全栈开发服务

```bash
npm run dev
```

启动后访问：
- **Web 界面**：[http://localhost:5188](http://localhost:5188)
- **API 服务**：[http://localhost:3000](http://localhost:3000)

---

## 🐦⬛ 技术栈

- **服务端**：Node.js, TypeScript, Express, Server-Sent Events (SSE)
- **前端**：Vue 3 (Composition API), Vite, Tailwind CSS
- **文稿编译与导出**：PptxGenJS, Python (`python-pptx`)
- **工程化与测试**：Vitest, tsx, Zod

---

## 🐦⬛ 开源协议

本项目基于 [MIT License](./LICENSE) 协议开源。
