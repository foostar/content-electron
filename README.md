# dev

`$ export ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/`

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


### API_PREFIX
- http://content-distribution.apps.xiaoyun.com/api
- http://content-distribution-test-1.apps.xiaoyun.com/api
- http://content-distribution-test-2.apps.xiaoyun.com/api
