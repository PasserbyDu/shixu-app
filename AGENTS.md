# 统一弹框

- 新增、修改业务弹框统一使用 `components/app-dialog/app-dialog.uvue`，不再在页面直接使用 `uni-popup`、`uni.showModal` 或手写遮罩。组件内部继续复用全局 `uni-popup`。
- 以 Figma `134:758` 为规范：标题左对齐、右上角 X、正文独立滚动、底部操作固定、校验失败保留输入。按 390px 设计宽度换算 rpx，文字不得小于 20rpx。
- 按钮优先使用组件的 `confirm-text`、`cancel-text`、`danger-text` 和对应事件。只有标准按钮无法表达业务时才使用 `footer` 插槽，仍须遵循同一套尺寸与颜色。
- 确认按钮不自动关闭。业务验证及保存成功后再调用 `close()`，避免输入丢失。表单校验错误通过 `error` 属性展示，关闭后的业务清理由 `close` 事件处理。
- 轻提示沿用 `utils/toast.uts`，系统文件选择、权限申请等原生界面维持平台行为。
- 参数与示例见 `components/app-dialog/README.md`。公共配色在 `uni.scss` 的 `$dialog-*` 变量中维护，不在页面复制弹框样式。
