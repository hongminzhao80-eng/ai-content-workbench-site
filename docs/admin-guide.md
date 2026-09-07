# 官网管理员操作手册

适用对象：负责 AI内容创作工作台官网日常运营/维护的管理员。
编写日期：2026-09-07（官网建设 + 表单后端 + 管理后台完成后）。

## 0. 系统架构一览

| 层 | 组件 | 位置/地址 |
|---|---|---|
| 官网前台（静态） | GitHub Pages 站点 | https://hongminzhao80-eng.github.io/ai-content-workbench-site/ |
| 源码与发布 | GitHub 仓库（main + gh-pages 两分支） | https://github.com/hongminzhao80-eng/ai-content-workbench-site |
| 表单后端 API | CloudBase 云函数 lead-api + HTTP 网关 /api/v1 | https://gzzhm518-d2g3ba6o6ecfb077f-1251417578.ap-shanghai.app.tcloudbase.com/api/v1 |
| 线索数据库 | CloudBase 云数据库集合 leads | 腾讯云控制台 → 云开发 → 数据库 |
| 线索管理后台 | CloudBase 云函数 admin-leads + 网关 /admin | https://gzzhm518-d2g3ba6o6ecfb077f-1251417578.ap-shanghai.app.tcloudbase.com/admin |
| 云环境 | gzzhm518-d2g3ba6o6ecfb077f（体验版，2027-02-25 到期，区域 ap-shanghai） | 腾讯云控制台 → 云开发 |

数据流向：访客在官网填表 → 浏览器 POST（带 Origin 白名单）→ CloudBase 网关 /api/v1 → lead-api 云函数校验/幂等/限流 → 写入 leads 集合 → 管理员在 /admin 后台查看与跟进。

## 1. 日常任务一：查看与跟进新线索（最重要）

1. 浏览器打开后台：https://gzzhm518-d2g3ba6o6ecfb077f-1251417578.ap-shanghai.app.tcloudbase.com/admin
2. 输入管理口令进入（口令见本地文件 .admin-key；本浏览器会记住，点右上角 锁定/退出 可切换账号场景）。
3. 表格按提交时间倒序展示：类型（试用/演示/合作）、状态、机构、地区、联系人、手机、微信、需求/业务、留言、来源页。
4. 状态流转建议：新线索 → 已联系 → 已完成；误报/垃圾标 无效 或直接 删除。
5. 拉新建议流程：每天上班打开 /admin → 看状态=新线索 → 按手机号联系 → 标 已联系 → 演示/成交后标 已完成。

字段口径：lead_type（trial 试用 / demo 演示 / partner 合作）；status（new / contacted / done / invalid）；来源 source 与 landing_page 记录访客入口（可统计渠道效果）。

## 2. 日常任务二：更新网站内容并发布

所有网页文案都在内容源里：content/*.js（首页/产品/行业/案例/文章/FAQ/法律/落地页），站点级配置在 site.config.js（品牌、联系方式、域名、表单端点、合规词）。

发布三步：

    cd D:\网络营销\AI内容创作工作平台资料\官网建设
    node scripts/build.mjs     # 重新生成 dist/（先确认无报错）
    node scripts/check.mjs     # 质量门禁：0 错误 0 告警再发布
    node scripts/publish-pages.mjs "chore(web): 说明本次改动"   # 提交 main 并重建 gh-pages
    git push origin main && git push origin gh-pages --force

说明：
- publish-pages.mjs 会自动 build 吗？不会自动执行 build，请先手动 build+check（或传参让脚本内 build：脚本默认会先执行 build，可加 --no-build 跳过）。默认执行 build；为稳妥请先自行 check。
- 推送走 SSH（已配置）。GitHub 22 端口偶发超时，可用 443 兜底：

    git push ssh://git@ssh.github.com:443/hongminzhao80-eng/ai-content-workbench-site.git main
    git push ssh://git@ssh.github.com:443/hongminzhao80-eng/ai-content-workbench-site.git gh-pages --force

- GitHub Pages 有 CDN 缓存，发布后约 1-10 分钟生效；核对线上时建议 Ctrl+F5。
- 改 site.config.js 后记得重新 build（影响全站 canonical / 表单端点 / 页脚等）。

## 3. 日常任务三：线索数据备份与导出

方式 A（命令行导出，推荐定期）：

    tcb db nosql dump leads --file-type json --output-dir ./backup -e gzzhm518-d2g3ba6o6ecfb077f
    tcb db nosql dump leads --file-type csv --fields _id,created_at,lead_type,organization_name,contact_name,mobile,province,city,status --output-dir ./backup -e gzzhm518-d2g3ba6o6ecfb077f

方式 B（控制台）：腾讯云 → 云开发 → 数据库 → 集合 leads → 导出/筛选。
建议：每周导出一次留档；体验版到期前务必导出全部数据。

## 4. 管理口令管理

- 口令存放：仓库根 .admin-key（已 gitignore，绝不提交）；仓库 cloudbaserc.json 里仅为占位符 REPLACE_BEFORE_DEPLOY。
- 更换/轮换口令（一条命令，自动注入+部署+还原占位）：

    node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"   # 生成新口令（64 位十六进制）
    把新口令写进 .admin-key（不要带多余空格/换行以外的字符）；
    node scripts/deploy-admin.mjs   # 读 .admin-key → 部署 → 自动还原占位

- 验证：打开 /admin 用新口令登录；旧口令应提示 口令错误或无权限。
- 泄露处置：若口令曾出现在公开渠道（对话、截图、公网仓库），立即按上述流程轮换。

## 5. 表单后端维护（lead-api）

- 函数代码：cloudfunctions/lead-api/（自动建集合 leads；服务端校验、submission_id 幂等 409、IP 限流 429、Origin 白名单 403、字段白名单）。
- 重新部署：

    tcb fn deploy lead-api -e gzzhm518-d2g3ba6o6ecfb077f

- 网关路由：/api/v1 → lead-api（配置在 cloudbaserc.json 的 gateway.routes）；改路由：

    tcb deploy --only=gateway -e gzzhm518-d2g3ba6o6ecfb077f

- 前端端点：site.config.js → forms.leadsEndpoint / partnersEndpoint（当前指向 CloudBase 网关），demoMode=false。
- 自检接口：提交一条测试数据应返回 201；同一 submission_id 重复提交应 409；错误手机号 400；非白名单 Origin 403（浏览器跨域由函数白名单控制，体验版不支持网关级安全域名）。

## 6. 后台维护（admin-leads）

- 函数代码：cloudfunctions/admin-leads/（页面 page.html + API：?action=list|set|del|check&key=…）。
- 部署：统一用 node scripts/deploy-admin.mjs（自动带真实口令部署，避免覆盖口令的坑）。
- 前端改动：改 cloudfunctions/admin-leads/page.html 后运行同一部署脚本即可。
- 后台访问与 API 同源，无跨域问题；页面响应带 Cache-Control: no-store，浏览器不会缓存旧版。

## 6.5 新线索邮件即时通知

- 官网表单新提交会即时向「通知邮箱」发邮件提醒（类型/机构/联系人/手机/留言/后台链接）；发送失败不影响线索入库（201 仍返回）。
- 发件配置（lead-api 云函数环境变量，凭据请到控制台配置、勿入仓库）：
  - SMTP_HOST=smtp.qq.com
  - SMTP_PORT=465
  - SMTP_USER=发件QQ邮箱
  - SMTP_PASS=该邮箱的 SMTP 授权码（QQ 邮箱：设置→账户→开启服务→生成授权码）
  - （可选）SMTP_FROM_NAME=发件显示名
- 收件人设置：管理后台 → 工具栏「通知邮箱」按钮 → 输入收件邮箱（存 app_config.notify_settings）；
  未设置时默认发给 SMTP_USER（发件本人）。
- 自检：SMTP 配好后，提交一条官网测试线索，应能在收件箱收到「官网新线索」邮件；收不到先查 lead-api 函数日志（console.error 含邮件通知失败原因）。
- 注意：更换/重部署 lead-api 时若 cloudbaserc.json 无 envVariables，云端 SMTP_* 环境变量可能被保留也可能被覆盖——重部署后建议用上面自检再验证一次；稳妥做法是先导出再设置。

## 7. 故障排查速查表（来自真实排障经验）

| 现象 | 原因 | 处理 |
|---|---|---|
| 后台打开空白/无输入框 | 浏览器缓存旧版页面脚本 | Ctrl+F5 强刷；页面已 no-store 不再缓存 |
| 提示 口令错误或无权限 | 输入有误；或部署覆盖了环境变量（cloudbaserc 占位符） | 重新输入；执行 node scripts/deploy-admin.mjs 恢复真口令 |
| 登录成功但报 null 读取 value | 旧版页面时序 bug（已修复） | 强刷页面即可；本手册版本含修复 |
| 表单提交后提示 提交暂时失败 | 后端不可达或函数报错 | 检查网关 https://…app.tcloudbase.com/api/v1 是否 200/405；tcb fn deploy lead-api 重部署；看函数日志 |
| 表单提交成功但后台看不到 | 前端 demoMode 仍为 true 或端点未指向网关 | 检查 site.config.js demoMode=false 与 endpoints；重新 build+发布 |
| git push 超时/失败 | GitHub SSH 22 端口网络问题 | 用 443 命令推送（见第 2 节） |
| 中文字符显示乱码（如 ??? ） | 用 PowerShell Invoke-WebRequest -Body 字符串提交所致（工具编码问题），真实浏览器不受影响 | 用浏览器/Node fetch 提交验证；已入库乱码记录可后台删除 |
| 体验版资源不可用 | 套餐限制（如无法配安全域名/加限流网关） | 正式运营升级套餐；体验版到期 2027-02-25 |

## 8. 安全与合规须知

1. 口令/密钥类（.admin-key、ADMIN_KEY、登录密码）严禁写入仓库或公开渠道；发现即轮换。
2. 表单接口已做服务端校验/限流/幂等；正式上线仍建议：升级套餐后开网关鉴权或接 CMS 登录；数据库定期备份。
3. 官网文案合规由 npm run check 兜底（禁止词/医疗免责/敏感特征）；发布前请勿删除合规声明。
4. 上线前替换清单仍在 site.config.js（正式域名/主体/联系方式/ICP/Logo 等占位），正式对外前务必完成（详见 README 第五节）。
5. 腾讯云登录账号密码请勿在对话/群聊中明文发送（本手册示例已提醒）。

## 9. 常用命令速查

    node scripts/build.mjs                 # 构建 dist
    node scripts/check.mjs                 # 质量检查
    node scripts/publish-pages.mjs "msg"   # 提交并重建 gh-pages 分支
    node scripts/deploy-admin.mjs          # 部署/更新管理后台（自动注入口令）
    tcb fn deploy lead-api -e gzzhm518-d2g3ba6o6ecfb077f
    tcb deploy --only=gateway -e gzzhm518-d2g3ba6o6ecfb077f
    tcb db nosql dump leads --file-type json --output-dir ./backup -e gzzhm518-d2g3ba6o6ecfb077f
    npm run serve                          # 本地预览 http://127.0.0.1:8630/

## 10. 账号/凭据清单（敏感，仅管理员本地保管）

| 项 | 值（位置） | 备注 |
|---|---|---|
| GitHub 仓库 | hongminzhao80-eng/ai-content-workbench-site | SSH 推送已配置 |
| CloudBase 环境 | gzzhm518-d2g3ba6o6ecfb077f | 体验版到期 2027-02-25 |
| 后台管理口令 | .admin-key（本地） | 换人交接时轮换 |
| 腾讯云账号 | 见密码管理器（勿明文存放本仓库） | CLI 登录态在 .tcb/（gitignored） |