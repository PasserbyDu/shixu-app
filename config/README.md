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

分类 ID：`life` 生活、`office` 办公、`image` 图片、`development` 开发、`finance` 财务、`ai` AI。

`getToolsByCategory('all')` 等同于 `getAllTools()`；不存在的分类返回空数组。
查询返回新的数组；工具和分类对象用于只读展示，页面不要直接修改配置对象。

新增工具时在 `tools` 中添加完整记录，再将 ID 加入对应分类的 `toolIds`。
早期的 `image-compress`、`interest` ID 分别兼容映射到 `image`、`deposit`，已有收藏可继续读取。

已开发工具的页面路径由 `getToolPath(id)` 返回，尚未实现时返回空字符串。
页面通过 `@/utils/tool-navigation` 的 `navigateToTool(tool)` 统一打开工具。
日期差计算、时间计算、单位换算分别对应 `date`、`time`、`unit`。
