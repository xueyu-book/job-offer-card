# job-offer-card

Vue 3 + Vite 求职卡项目。入口按设备加载 `src/views/web/` 或 `src/views/mobile/` 页面。

## 开发

```bash
npm install
npm run dev
```

## 构建 / 预览

```bash
npm run build
npm run preview
```

## 目录说明

| 路径 | 说明 |
|------|------|
| `src/views/web/` | PC 端页面（设计稿 1920，px → rem 基准 192） |
| `src/views/mobile/` | 移动端页面（设计稿 375，px → rem 基准 37.5） |
| `src/utils/device.js` | 设备检测 |
| `src/utils/rem.js` | 动态根字号 |
| `vercel.json` | Vercel SPA 部署 |

## 适配约定

- 样式中直接写设计稿 `px`，由 `postcss-pxtorem` 转换
- `src/views/mobile/` 路径下的样式按 375 稿；其余按 1920 稿
- 部署到 Vercel 时会自动 `npm run build`，输出 `dist`
