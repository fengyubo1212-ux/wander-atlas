# 🌏 随行 Wander

> 陌生的地方，也能轻松出发。

0 元版导航 + 旅游规划平台。帮助用户在陌生地方解决"怎么去"和"怎么玩"。

## 功能

### 🧭 导航
- 出发地 → 目的地路线规划
- 步行、骑行、驾车三种交通方式
- 地图实时显示路线
- 浏览器定位支持
- 地点搜索（Nominatim 地理编码）
- 路线详情与步骤
- API 失败自动降级到演示数据

### ✈️ 旅行
- 按目的地、日期、人数、预算规划旅行
- 8 种旅行风格（穷游/舒适/豪华/特种兵/佛系/拍照/情侣/家庭）
- 10 种旅行兴趣标签
- 智能行程规划（地理聚类，减少来回移动）
- 预算估算
- 每日行程安排
- 景点卡片（停留时间、评分）

### 🔗 联动
- 旅行景点 → 点击"怎么去" → 跳转导航
- 导航结果 → 点击"加入行程" → 选择 Day 添加

### 📱 数据
- 收藏景点
- 最近搜索记录
- 我的行程管理
- localStorage 本地存储

## 技术栈

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| Vite 6 | 构建工具 |
| TypeScript 5 | 类型安全 |
| React Router 7 | 路由（HashRouter） |
| Leaflet + OpenStreetMap | 地图 |
| OpenRouteService | 路线 API |
| Nominatim | 地理编码 |
| localStorage | 数据持久化 |

## 项目结构

```
src/
├── components/    # 通用组件（地图、搜索、导航栏）
├── pages/         # 页面组件
├── services/      # API 服务（geocoding、routing、places）
├── hooks/         # 自定义 Hooks
├── store/         # localStorage 管理
├── types/         # TypeScript 类型
├── utils/         # 工具函数
└── data/demo/     # 演示数据
```

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

| 变量 | 说明 | 必需 |
|------|------|------|
| `VITE_ORS_API_KEY` | OpenRouteService 免费 API Key | 否 |

不填写 API Key 时自动进入 **Demo 模式**，使用演示数据。

## Demo 模式

没有 API Key 时，网站使用预设的演示数据：

- 演示地点（吉隆坡、东京景点）
- 演示路线（步行/骑行/驾车）
- 演示旅行计划

演示数据明确标注，不会伪装成真实数据。

## GitHub Pages 部署

1. Fork 或创建 GitHub 仓库
2. 推送代码到 `main` 分支
3. 在 Settings → Pages → Source 选择 "GitHub Actions"
4. 推送后自动构建和部署

使用 HashRouter，刷新页面不会 404。

## 数据来源

- 地图：© [OpenStreetMap](https://www.openstreetmap.org/) contributors
- 路线：[OpenRouteService](https://openrouteservice.org/)（免费额度 2000 请求/天）
- 地理编码：[Nominatim](https://nominatim.openstreetmap.org/)（免费，限制 1 请求/秒）

## 未来规划

- [ ] 接入公共交通数据 (GTFS)
- [ ] AI 旅行规划
- [ ] 天气集成
- [ ] 多语言支持
- [ ] 离线地图
- [ ] PWA 支持
