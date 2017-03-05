import React, {Component} from 'react';
import Page from 'components/Page';
import style from './style.styl';
import {IndexLink, Link} from 'react-router';
import {Layout, Button} from 'antd';
// import {connect} from 'react-redux';
// import moment from 'moment';
// import {bindActionCreators} from 'redux';
// import {uniqBy} from 'lodash';

// import * as upstreamsActions from 'reducers/upstreams';
// import * as reproductionActions from 'reducers/reproduction';

// import {platformsById} from 'lib/platforms';
// import OMQQPlatform from 'lib/omqq-platform';
// import BaiJiaPlatform from 'lib/baijia-platform';

const {Header, Content} = Layout;

// const mapStateToProps = state => {
//     return {
//         upstreams: state.upstreams.data,
//         statByUpstream: state.reproduction.upstream
//     };
// };
// const mapDispatchToProps = dispatch => {
//     return {
//         upstreamsActions: bindActionCreators(upstreamsActions, dispatch),
//         reproductionActions: bindActionCreators(reproductionActions, dispatch)
//     };
// };

// @connect(mapStateToProps, mapDispatchToProps)
class Stat extends Component {
    render () {
        return (
            <Page>
                <Layout className={style.layout}>
                    <Header className={style.header}>
                        <IndexLink to='/admin/stat' activeClassName={style.active}>
                            <Button>按平台统计</Button>
                        </IndexLink>
                        <Link to='/admin/stat/redactor' activeClassName={style.active}>
                            <Button>按小编统计</Button>
                        </Link>
                        <Link to='/admin/stat/author' activeClassName={style.active}>
                            <Button>按内容提供者统计</Button>
                        </Link>
                    </Header>
                    <Content style={{padding: 20}}>
                        {this.props.children}
                    </Content>
                </Layout>
            </Page>
        );
    }
}

export default Stat;
