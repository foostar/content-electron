# dev

`$ ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/`

`$ npm install`

`$ npm run dev`

- electron
- antd
- stylus
- react
- redux
- redux-act


# 增加 page 使用 Page 组件包裹起来
```javascript
import Page from './components/Page'

class SomePage extends Component {
    render () {
        return (
            <Page>
                {/* ... */}
            </Page>
        )
    }
}

```


# 增加平台账号

1. 工具登录状态                          - token
2. 选择平台 (企鹅/百家...)                - token, platform
3. 清理默认 Cookies, 保证显示登录界面
4. 切换到对应的 webview, 等待用户登录     - token, platform, partition
5. 监听检测登录成功                      - token, platform, partition, account
6. 通知 main 获取 Cookies               - token, platform, partition, account, cookies
7. 通知 render 获取成功                  - token, platform, partition, account, cookies
8. 提示用户, 切换路由, xhr 给服务器保存    - token, platform, partition, account, cookies
9. 清理 Cookies

# 发布文章
1. 选择需要发布的文章                - articleId
2. 选择需要发布的平台                - articleId, platform
3. 选择对应平台下的账号              - articleId, platform, account
4. 根据 account 设置 Cookies (是否需要重新获取Cookies?)
5. 打开 对应发文的 webview
6. 阻止默认 submit event
7. 填充内容
8. 小编编辑...点击发布
9. 拦截发布事件, 插入 唯一标识的 hide img
10. 检测发布是否成功
11. xhr 更新文章状态                - token, articleId, platform, account
12. 提示小编发布成功
13. 清除 Cookies
