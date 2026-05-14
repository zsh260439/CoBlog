# API Detail

这个目录用于记录项目中实际使用到的第三方接口、调用位置、用途和可替代方案，方便二次开发或后续替换。

## 1. DeepSeek Chat Completions API

- 用途：AI 对话、正文优化、摘要生成、流式助写
- 当前默认地址：`https://api.deepseek.com/chat/completions`
- 配置位置：
  - `apps/server/src/ai/ai.service.ts`
- 相关环境变量：
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_API_URL`
  - `DEEPSEEK_MODEL`
- 说明：
  - 当前项目通过外部模型接口提供 AI 能力，不是本地模型推理。
  - 如果后续要替换，只要兼容 OpenAI 风格的聊天补全接口，改动通常不会太大。

## 2. 访客 IP 归属地查询接口

- 用途：补充访客地区信息，用于访客展示或统计
- 当前接口：`https://uapis.cn/api/v1/network/ipinfo`
- 调用位置：
  - `apps/server/src/common/utils/resolve-location.ts`
- 说明：
  - 当前请求参数里使用了 `source=commercial`
  - 接口请求失败时，代码会回退为空字符串，不会阻塞主流程
- 可替代方向：
  - 自建 IP 库
  - 其他地理位置查询服务
  - 完全关闭归属地展示

## 3. 随机封面图接口

- 用途：为文章自动补充随机封面图
- 当前接口：`https://t.alcy.cc/fj`
- 调用位置：
  - `apps/server/src/utils/image.service.ts`
  - `apps/server/src/articles/article.service.ts`
- 说明：
  - 当前逻辑通过请求这个地址并读取重定向后的最终图片地址作为封面图
  - 适合个人项目快速接入，但不建议作为唯一长期依赖
- 可替代方向：
  - 本地静态图片
  - 自维护封面图列表
  - 对象存储（OSS / COS / S3 兼容存储）

## 4. 上传图片接口说明

- 用途：后台编辑文章时上传正文图片
- 接口：`/uploads/image`
- 访问地址：`/uploads/images/:id`
- 代码位置：
  - `apps/server/src/uploads/uploads.controller.ts`
  - `apps/server/src/uploads/uploads.service.ts`
- 说明：
  - 这部分不是第三方图床
  - 上传后的图片会保存在 MongoDB 中，再通过后端接口读取返回
  - 因此这块部署后可自给自足，不依赖外部图片 API

## 总结

当前项目里真正依赖外部第三方服务的，主要是：

- DeepSeek AI 接口
- IP 归属地查询接口
- 随机封面图接口

上传图片本身不是第三方托管，而是项目自身接口能力。
