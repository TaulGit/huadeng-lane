# 花灯里 · 开发验收记录

## 已验证
- npm test：6 项经营逻辑测试通过，覆盖占地与资金约束、住房和庭园升级、定价影响、14 天胜利可达、破产救济、存档格式。
- npm run build：生产包构建通过。
- star-letter check：directory 模式，12 个 GLB 全部纳入包，warnings=[]。
- 运行时模型使用 GLTFLoader，独立建筑可建造、升级、拆除；正交参考改为可旋转透视街区。

## Storage CDR（SDK v2.7.1 rev39）
- S1/S2 pass：固定 user key，8 个地块、最多 14 条日报，远小于 16MB。
- S3 pass：建造、调价、升级、拆除、结算与手动保存触发，每次一个 set；没有周期存档。
- S4/S5 pass：默认 user scope，无 localStorage/IndexedDB 自建存档，无 CAS 重试，带 saveMeta。
- S6 pass：读取失败断开写入权限，仅保留临时试玩，不覆盖未知云档；写入失败展示提示，pending 展示保存中。
- S7 pass：静态建筑配置留代码，存档只保存 type、level、price 与经营状态。

## 待验收 / 未完成
- 创作者在平台预览页验证 SDK 握手、真实存档、浏览器交互和移动端布局。
- 广告兑换补给与平台配置尚未接入；收费方式待用户选择。
- 活动报名、公开发布与 LOFTER 广告验收尚未执行。
- 当前为可玩开发版本，不声明正式参赛交付完成。
