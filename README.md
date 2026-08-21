# 🌏 随行 Wander

> 陌生的地方，也能轻松出发。

0 元版导航 + 旅游规划平台。帮助用户在陌生地方解决"怎么去"和"怎么玩"。

## 功能

### 🧭 导航
- 出发地 → 目的地路线规划
- 步行、骑行、驾车
- 地图实时显示路线
- 当前定位支持

### ✈️ 旅行
- 按日期、人数、预算规划旅行
- 旅行风格 & 兴趣选择
- 每日行程安排
- 景点卡片

### 🔗 联动
- 旅行景点 → 怎么去 → 导航
- 导航目的地 → 加入行程

## 技术栈

- React + Vite + TypeScript
- React Router (HashRouter)
- Leaflet + OpenStreetMap
- OpenRouteService (路线)
- Nominatim (地理编码)
- localStorage (数据保存)

## 本地运行

```bash
npm install
npm run dev
```

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

### API Key 配置

| 变量 | 说明 | 必需 |
|------|------|------|
| `VITE_ORS_API_KEY` | OpenRouteService 免费 API Key | 否 |

不填写 API Key 时自动进入 **Demo 模式**，使用演示数据。

## Demo 模式

没有 API Key 时，网站使用预设的演示数据：

- Demo 地点（吉隆坡、东京）
- Demo 路线
- Demo 旅行计划

演示数据明确标注，不会伪装成真实数据。

## GitHub Pages 部署

1. Fork 或创建 GitHub 仓库
2. 推送代码到 `main` 分支
3. 在 Settings → Pages 中启用 GitHub Actions
4. 推送后自动部署

## 数据来源

- 地图：© [OpenStreetMap](https://www.openstreetmap.org/) contributors
- 路线：[OpenRouteService](https://openrouteservice.org/) (免费额度)
- 地理编码：[Nominatim](https://nominatim.openstreetmap.org/) (免费，需遵守使用政策)

## 免费额度说明

- OpenRouteService：免费额度 2000 请求/天
- Nominatim：免费，限制 1 请求/秒
- GitHub Pages：免费托管

## 未来规划

- [ ] 接入公共交通数据 (GTFS)
- [ ] AI 旅行规划
- [ ] 天气集成
- [ ] 多语言支持
- [ ] 离线地图
