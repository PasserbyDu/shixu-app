# 统一弹框 AppDialog

设计来源：[Figma S01，134:758](https://www.figma.com/design/UQoyHz02FJeU7jbvglW0jG/?node-id=134-758)。自动按 components 目录解析组件，页面无需单独注册。

所有业务弹框使用本组件。底层 `uni-popup` 管理遮罩和居中，组件负责标题、关闭入口、正文滚动、固定操作区、错误提示、安全区与键盘避让。业务页面只维护数据、验证和保存逻辑。

## 视觉规范

| 项目 | 390px 设计值 | 实现 |
| --- | --- | --- |
| 弹框宽度 | 350px | 674rpx |
| 圆角、内边距 | 20px | 38rpx |
| 按钮高度、间距 | 46px、10px | 至少 88rpx、20rpx |
| 遮罩 | #14273F / 40% | `uni.scss` 的 `$dialog-mask-color` |
| 标题 | 18px | 34rpx，左对齐 |
| 正文、辅助文字 | 12–13px、10–11px | 通常 24–26rpx、20–22rpx，不低于 20rpx |

主操作使用蓝靛渐变；次操作使用浅蓝底；删除操作使用浅红底。关闭图标有独立的 88rpx 点击区域。长内容只滚动正文，按钮不放进正文插槽；尽量简短描述与按钮文字，避免多行操作标签。

## 基本用法

```vue
<app-dialog
  ref="formDialog"
  title="编辑记录"
  subtitle="记录仅保存在本机"
  confirm-text="保存记录"
  :error="formError"
  @confirm="saveRecord"
  @close="resetDraft"
>
  <!-- 表单或确认正文；说明文字需显式设置字号与行高 -->
</app-dialog>
```

```ts
type DialogRef = { open: () => void, close: () => void }
const formDialog = ref<DialogRef | null>(null)
const formError = ref('')
const saveRecord = () => {
  // 验证失败只更新 formError，保留输入；成功保存后才关闭。
  formDialog.value?.close()
}
```

也可使用 `:visible="visible"`，由父级响应 `close` 事件将 `visible` 设为 false。不要给组件添加 `v-if` 来控制弹框；命令式 ref 与 visible 选一种控制方式。

## 参数与事件

| 参数 | 默认值 | 用途 |
| --- | --- | --- |
| title / subtitle | 空 | 标题、辅助说明 |
| visible | false | 可选的状态控制方式 |
| error | 空 | 浅红错误提示，出现后滚动到提示位置 |
| confirmText / cancelText | 确定 / 取消 | 主、次按钮，空字符串隐藏对应按钮 |
| dangerText | 空 | 额外的删除按钮；只在编辑既有记录时提供 |
| confirmDisabled | false | 禁用主操作并降低透明度 |
| closeOnCancel | true | 次操作是否关闭；“复制”等辅助动作设置为 false |
| showFooter / showClose / maskClosable | true | 操作区、右上角 X、点击遮罩关闭 |
| scrollIntoView | 空 | 定位正文中的输入项，不传给外层页面 |

- `confirm`：执行验证/保存，不自动关闭。异步操作自行维护禁用状态，防止重复提交。
- `cancel`：次按钮事件，随后按 `closeOnCancel` 决定是否关闭。
- `danger`：删除按钮事件，不自动关闭；业务成功后主动关闭。
- `close`：X、遮罩、取消、visible 变为 false 或主动 close 后发出一次，可用于清理临时状态；不会删除业务记录或返回上一页。确实需要返回的页面自行处理。
- 默认插槽：业务正文；`footer` 插槽：特殊操作区，由外层固定在正文之外。

用户输入与记录归业务页面所有，组件不清空输入、不写存储、不发请求。错误不要通过关闭弹框处理。成功复制等短提示继续调用项目 `toast()`；系统权限与文件选择等原生界面不替换。

## 已迁移范围

宠物管理、健身记录与动作库、番茄专注、出行清单、农历日期、随机点名的导入/结果/重置、图片取色详情、关卡选择器，以及数字 2048 和华容道的重新开始/游戏结果。旧的 `styles/tool-popup.scss` 与点名工具重复按钮样式已移除。
