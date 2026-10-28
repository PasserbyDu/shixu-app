# 分享给朋友

- 入口：我的 → 更多 → 分享给朋友；页面位于本分包 `share.uvue`。
- 微信小程序采用原生 `button open-type="share"`，由用户在微信面板选择好友或群聊；页面 `onShareAppMessage` 返回首页 `/pages/index/index` 及分享标题。不用点击事件模拟分享，不提示“分享成功”，也不自动发送消息。
- App、网页没有配置微信分享SDK，按钮点击提示前往微信小程序，不调用不可用的SDK。
- 当前没有可直接打开小程序的有效链接，按用户要求移除复制按钮、菜单指引、剪贴板逻辑及空链接配置。只保留真实的小程序卡片分享。
- 头部复用工具页 `page-header-calculator-bg` 浅蓝背景与深色文字。Logo使用用户提供的HTTPS图片，按原比例显示。页面关键字号、留白、居中采用局部SCSS，避免依赖现有小程序样式产物中缺失的工具类。
- 分享按钮的视觉容器固定96rpx高，原生分享按钮覆盖整个点击区域，避免原生按钮默认内边距影响排版；外层点击不模拟微信分享。
- 仅完成静态检查，未进行编译、页面运行或真机分享验证。

官方依据：[uni-app x页面分享事件](https://doc.dcloud.net.cn/uni-app-x/page.html#onshareappmessage)、[分享说明](https://uniapp.dcloud.io/api/plugins/share)。
