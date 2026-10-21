# shixu-app

拾序 · 万事有方，生活有序。

基于 `mbk_health_uniapp_doctor` 的通用基础整理的 uni-app x 新项目模板，直接在本仓库根目录开发。

## 页面

原生 tabBar 包含四个独立页面，支持通过 `uni.switchTab` 切换：

| tab | 页面路径 | 初始内容 |
| --- | --- | --- |
| 首页 | `pages/index/index.uvue` | 品牌信息、快捷入口 |
| 分类 | `pages/category/index.uvue` | 分类空状态 |
| 收藏 | `pages/favorites/index.uvue` | 收藏空状态、去逛逛入口 |
| 我的 | `pages/mine/index.uvue` | 品牌信息、版本 |

模板不预设分类数据、收藏业务或登录接口，也不会在启动时请求远程接口。

### 工具页面分包

四个 tab 页面放在主包 `pages/`，工具页面按分类放在 `subPackages/<分类 ID>/`，通过 `uni.navigateTo` 打开。
目前已注册生活工具分包 `subPackages/life`，包含日期差计算、时间计算、单位换算。
页面路径在 `pages.json` 注册，工具入口统一由 `config/tools.uts` 的 `getToolPath` 管理。
后续新增工具沿用分类 ID 建分包；同一工具跨分类展示时复用一个页面和路由。详见 `config/README.md`。
Tailwind 已扫描整个 `subPackages/`，新增分类目录可直接复用现有样式配置。

## 使用

1. 使用 Node.js `^22.18.0 || >=24.11.0` 执行 `npm ci --include=optional` 安装样式依赖，再用 HBuilderX `>=5.11` 导入本目录。安装架构必须匹配 HBuilderX 的 Node.js，macOS 架构不一致的处理见下文。项目沿用 HBuilderX 工程结构，通过 HBuilderX 运行和发布。
2. 在 `manifest.json` 中为新项目获取自己的 uni-app AppID；开发微信小程序时填写自己的 `mp-weixin.appid`。按实际发布平台补齐签名、包名和发布配置。
3. 项目名称、介绍及版本发布信息在 `manifest.json` 中维护；页面展示信息统一在 `config/app.uts` 中修改，版本展示需与 manifest 保持一致。
4. 对接后端时在 `config/request.uts` 填写测试/生产接口地址，通过 `REQUEST_ENV` 切换环境；初始地址留空，工具会拒绝未配置根地址的相对路径请求。
5. 在 `api/` 下按业务新增 `.uts` 接口模块，调用 `utils/request.uts` 的 `get / post / put / del / upload`；页面调用接口模块。请求约定及鉴权见下文。

## 通用基础

- `main.uts`：Vue 3 入口，全局注册 `UniIcons`。
- `styles/`、`uni.scss`：源项目的基础主题、字号/间距工具类、通用 flex 和颜色样式。
- `components/page-header`、`components/capsule`、`utils/system.uts`：按需使用的自定义导航与系统区域适配；当前四个 tab 使用系统导航。
- `components/empty-state`、`components/load-more`：空状态和列表加载提示。
- `utils/storage.uts`：同步/异步存储封装；`utils/toast.uts`：统一提示。
- `utils/login.uts`：token、用户信息及登录态清理，不包含登录业务。存储 key 在 `config/constants.js`，以 `shixu:` 为前缀。
- `utils/request.uts`：请求与上传、token、并发 loading、错误处理。沿用源项目 `{ status, msg, errorCode, data }` 响应约定，业务 `status === 200` 成功；无业务状态时读取 HTTP 状态码。默认返回响应体，`fullResponse: true` 返回完整响应。可选 `needToken / showLoading / showError / baseUrl / timeout / header`。
- 收到 401 时统一清除登录态并切换到“我的”。正式接入登录流程时在 `handleAuthExpired` 中改为新登录页，并在 `pages.json` 注册该页面。
- `uni_modules/uni-icons` 及其 `uni-scss` 依赖：保留源项目版本；图标类型参照 [uni-icons 官方列表](https://uniapp.dcloud.net.cn/component/uniui/uni-icons.html)。
- `static/tabbar/`：从随项目保留的 uni-icons 字体导出的本地 PNG，普通/选中各一套；`static/empty.png` 为本地空状态图标。

医疗业务页面、医生/医助角色、IM/RTC 轮询、原生问诊插件、医疗图片、旧接口域名、原 AppID、构建产物及 Git 历史均未迁入。

## Tailwind CSS

按 [weapp-tailwindcss 最新 uni-app x 接入文档](https://tw.weapp.dev/docs/quick-start/frameworks/uni-app-x) 配置 Tailwind CSS v4，当前锁定 `tailwindcss 4.3.3`、`weapp-tailwindcss 5.6.3`，依赖版本由 `package-lock.json` 固定。

- `vite.config.js`：通过 `WeappTailwindcss(uniAppX(...))` 完成样式生成和多端转换，开启 `rem2rpx: true`。
- `main.css`：独立的纯 CSS 入口，使用 `@source` 扫描页面、组件及可能存放类名的 UTS 工具、hook、store；排除第三方组件及构建目录。
- `App.uvue`：使用一个全局 `<style lang="scss">`，通过相对路径依次导入 `./main.css` 和 `./styles/index.scss`。Sass 会将带 `.css` 后缀的导入保留为 CSS 导入，Tailwind 指令仍放在独立的纯 CSS 文件中，原有 SCSS 正常编译。
- `.vscode/settings.json`：为 `.uvue`、`.uts` 配置 Tailwind CSS IntelliSense 语言映射和 CSS 入口。

首页快捷入口已使用 `flex flex-row` 和 `mr-[24rpx]`，保留其它原有样式。可以继续组合使用：

```html
<view class="flex flex-row items-center p-[32rpx]">
  <text class="text-[28rpx] font-medium">内容</text>
</view>
```

开发约束：

- 原生 App 的文字样式直接设置在 `<text>` 上，避免依赖父元素继承。
- 跨端布局不用 `gap-*`、`space-x-*`、`space-y-*`，子元素间距用 `mt-*`、`ml-*` 等显式设置。
- 精确尺寸优先用 `p-[32rpx]`、`text-[28rpx]`。旧工具类 `mt24` 表示 24rpx，Tailwind 的 `mt-24` 使用自己的间距刻度，二者含义不同。
- 类名使用完整字符串，例如 `active ? 'text-blue-500' : 'text-gray-500'`，不要使用 `'text-' + color + '-500'` 这类动态拼接。
- 不需要添加 Tailwind v3 的配置文件、`weapp-tw patch` 或其它安装补丁脚本，也不要重复注册 `@tailwindcss/postcss` 或 `@tailwindcss/vite`。
- 新增自定义页面或组件目录时，同步调整 `@source` 和插件的本地样式匹配规则；样式隔离配置以项目实际需求为准。

### macOS 原生依赖的架构

Tailwind 的 Oxide 扫描器及其它原生依赖按运行它们的 Node.js 架构加载。Apple Silicon 终端可能运行 arm64 Node.js，而 HBuilderX 内置 Node.js 可能仍是 x64；此时直接在终端安装会缺少 HBuilderX 所需的 x64 包。不能只根据机器芯片或 Node.js 版本判断。

先查看实际用于构建的 HBuilderX Node.js 二进制架构，例如：

```sh
file /Applications/HBuilderX.app/Contents/HBuilderX/plugins/node/node
```

如果显示 `x86_64`，在项目目录安装 x64 的可选依赖：

```sh
npm ci --cpu=x64 --os=darwin --include=optional
```

如果显示 `arm64`，改用 `--cpu=arm64`。新增依赖时也应保持同样的 `--cpu`、`--os`、`--include=optional` 参数，避免 npm 根据终端架构替换原生依赖。不要关闭 optional dependencies；`@tailwindcss/oxide` 存在并不意味着它对应的原生平台包已经安装。

本机本次修复对应 HBuilderX x64，已按该架构补齐依赖。若 HBuilderX 仍显示旧错误，停止当前运行任务后重新运行，让构建进程重新加载依赖。

### 全局样式入口注意事项

此项目曾在微信小程序构建时出现 `Invalid declaration: toast`。全局样式入口改为相对路径并合并为单个样式块后，已使用原版 `weapp-tailwindcss 5.6.3` 完成开发、发行两种模式的编译，且同时保留 Tailwind 类和旧版字号、间距、颜色等工具类。

不要恢复为两个独立全局样式块：本机验证该写法即使能编译，也可能在最终 `app.wxss` 中丢失原有 SCSS 工具类。此前添加的第三方依赖兼容补丁已撤除，不需要修改 `node_modules`。

## 检查范围

初始模板阶段仅做静态检查。此次 Tailwind 排错已获授权，通过 HBuilderX 对微信小程序实际执行开发模式编译和发行编译（未上传），并检查两种模式生成的 WXSS/WXML。开发者工具打开项目时另报“ 不存在此 AppID（code 10）”，需核对自己的微信小程序 AppID 和开发者账号权限后再验证页面。Android、iOS、鸿蒙、Web 尚未编译验证。
