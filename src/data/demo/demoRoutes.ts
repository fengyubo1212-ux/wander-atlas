import type { Route } from '@/types'

export const demoRoutes: Route[] = [
  {
    id: 'demo-walking',
    mode: 'walking',
    distance: 2400,
    duration: 1800,
    summary: '步行路线',
    steps: [
      { instruction: '从起点出发，向东步行', distance: 200, duration: 150, mode: 'walking' },
      { instruction: '沿 Jalan Bukit Bintang 直行', distance: 500, duration: 375, mode: 'walking' },
      { instruction: '右转进入 Jalan Sultan Ismail', distance: 800, duration: 600, mode: 'walking' },
      { instruction: '继续直行 600 米', distance: 600, duration: 450, mode: 'walking' },
      { instruction: '左转到达目的地', distance: 300, duration: 225, mode: 'walking' },
    ],
    coordinates: [
      [3.152, 101.710],
      [3.153, 101.712],
      [3.155, 101.714],
      [3.157, 101.715],
      [3.1578, 101.7116],
    ],
  },
  {
    id: 'demo-cycling',
    mode: 'cycling',
    distance: 3200,
    duration: 900,
    summary: '骑行路线',
    steps: [
      { instruction: '从起点出发，沿自行车道骑行', distance: 400, duration: 112, mode: 'cycling' },
      { instruction: '沿 Jalan Tun Razak 骑行', distance: 1200, duration: 336, mode: 'cycling' },
      { instruction: '右转进入 Jalan Ampang', distance: 1000, duration: 280, mode: 'cycling' },
      { instruction: '继续骑行 600 米到达目的地', distance: 600, duration: 168, mode: 'cycling' },
    ],
    coordinates: [
      [3.152, 101.710],
      [3.154, 101.713],
      [3.156, 101.715],
      [3.1578, 101.7116],
    ],
  },
  {
    id: 'demo-driving',
    mode: 'driving',
    distance: 4800,
    duration: 720,
    summary: '驾车路线',
    steps: [
      { instruction: '从起点出发，驶入 Jalan Bukit Bintang', distance: 300, duration: 60, mode: 'driving' },
      { instruction: '右转进入 Jalan Sultan Ismail', distance: 1500, duration: 240, mode: 'driving' },
      { instruction: '上 KLCC 高架桥', distance: 1200, duration: 180, mode: 'driving' },
      { instruction: '下桥后左转', distance: 800, duration: 120, mode: 'driving' },
      { instruction: '到达目的地停车场', distance: 1000, duration: 120, mode: 'driving' },
    ],
    coordinates: [
      [3.152, 101.710],
      [3.154, 101.713],
      [3.156, 101.714],
      [3.157, 101.713],
      [3.1578, 101.7116],
    ],
  },
]
