# 接口模块

按业务在此目录添加 `.uts` 文件，统一调用 `@/utils/request`，页面只引入业务接口方法。

```ts
import { get } from '@/utils/request'

export const getCategories = () : Promise<any> => {
  return get('/categories', null, { needToken: false })
}
```

示例路径仅说明目录用法；模板未创建或调用该接口。接入时先填写 `config/request.uts` 的接口根地址，并确认后端响应结构与请求工具一致。
