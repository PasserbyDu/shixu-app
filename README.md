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

## 使用

1. 在 HBuilderX 中导入本目录，作为 uni-app x 项目开发；本模板沿用源项目的 HBuilderX 工程结构，没有配置 npm 运行脚本。
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

## 检查范围

本次仅进行路由、资源、导入依赖、业务残留和 Git 差异静态检查，未启动、运行或编译项目。Android、iOS、鸿蒙、Web、微信小程序的运行效果需配置独立 AppID 后在对应环境验证。
