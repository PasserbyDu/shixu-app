# 工具配置

所有工具、分类和页面工具 ID 组合统一维护在 `tools.uts`。

- `tools`：每个工具定义一次，包含名称、短名称、简介、详细描述、搜索关键词及图标样式。
- `categories`：通过 `toolIds` 指定该分类的工具和顺序；同一工具可归入多个分类。
- `HOME_TOOL_IDS` / `MINE_TOOL_IDS`：首页常用工具、我的页快捷工具。
- `DEFAULT_FAVORITE_IDS` / `RECOMMENDED_TOOL_IDS`：首次默认收藏、推荐工具优先顺序。

```ts
import {
  getTool,
  getAllTools,
  getToolsByIds,
  getToolCategories,
  getToolsByCategory,
  getToolGroups
} from '@/config/tools'

// 获取单个工具；不存在时返回 null。
const imageTool = getTool('image')

// 获取一个分类内的全部工具。
const imageTools = getToolsByCategory('image')

// 指定几个工具，按传入顺序返回并去重。
const commonTools = getToolsByIds(['image', 'date', 'json'])

// 按分类列出全部非空分组，count 根据实际工具数量生成。
const groups = getToolGroups()

// 仅列出指定分类的分组。
const selectedGroups = getToolGroups(['life', 'office'])

// 包含尚未配置工具的空分类。
const groupsWithEmpty = getToolGroups([], true)

// 全部工具去重列表、全部分类元数据。
const allTools = getAllTools()
const categories = getToolCategories()
```

分类 ID：`life` 生活、`office` 办公、`image` 图片、`development` 开发、`finance` 财务、`ai` AI、`games` 休闲游戏。

`getToolsByCategory('all')` 等同于 `getAllTools()`；不存在的分类返回空数组。
查询返回新的数组；工具和分类对象用于只读展示，页面不要直接修改配置对象。

新增工具时在 `tools` 中添加完整记录，再将 ID 加入对应分类的 `toolIds`。
早期的 `image-compress`、`interest` ID 分别兼容映射到 `image`、`deposit`，已有收藏可继续读取。

已开发工具的页面路径由 `getToolPath(id)` 返回，尚未实现时返回空字符串。
页面通过 `@/utils/tool-navigation` 的 `navigateToTool(tool)` 统一打开工具。
日期差计算、时间计算、单位换算分别对应 `date`、`time`、`unit`。

工具页面按分类放在 `subPackages/<分类 ID>/` 下，并在 `pages.json` 的 `subPackages` 中注册。
当前三个生活工具页面位于 `subPackages/life/`，四个 tab 页面保留在主包 `pages/` 中。
新增工具页面时同步维护分包注册和 `getToolPath(id)`；跳转路径为 `/<分包 root>/<页面 path>`。
办公、图片、开发、财务、AI 分包分别使用 `office`、`image`、`development`、`finance`、`ai`，有实际页面时再注册。
同一工具出现在多个分类时只保留一份页面和一个路由，按主要归属分类存放，各分类入口复用该路由。

当前已接入的新增工具：`image-pdf`、`pdf-merge`、`pdf-split`、`text` 对应办公分包；`image` 对应图片分包的图片压缩。
首页、分类、收藏、最近使用均复用 `navigateToTool`，无需在各页面单独维护新路由。
各平台支持范围与待验收用例见 `subPackages/office/README.md`。

休闲游戏分类 ID 为 `games`。`2048` 工具对应 `subPackages/games/number-2048.uvue`，游戏规则与本地存档说明见 `subPackages/games/README.md`。
`klotski` 工具对应同一分包中的 `klotski.uvue`，提供华容道横刀立马关卡；棋盘、撤销历史和前台用时均在本地保存。
