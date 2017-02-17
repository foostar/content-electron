import React from 'react';
import { Row, Col, Modal } from 'antd';

export default class ModalDetail extends React.Component {
    render () {
        const { modalShow, dataSource, columns, setModalVisible } = this.props;
        const modalContent = columns.map((v) => {
            let data = null;
            if (v.dataIndex.match('.')) {
                v.dataIndex.split('.').forEach((j) => {
                    if (data == null) {
                        data = dataSource[ j ];
                    } else {
                        data = data[ j ];
                    }
                });
            } else {
                data = dataSource[ v.dataIndex ];
            }
            if (v.isBooleans) {
                data = data == 0 ? '否' : '是';
            }
            if (v.isImg) {
                data = <img src={data} alt={data} />;
            }
            return (<Row key={v.key}>
                <Col span={8} className='text-right modal-item'>{ v.title }</Col>
                <Col span={16} className={v.isFlex == true ? 'modal-content' : ''}>{ data } </Col>
            </Row>);
        });
        return (
            <Modal
                title='查看详情'
                style={{ top: 20, width: 1200 }}
                visible={modalShow}
                onOk={() => setModalVisible(false)}
                onCancel={() => setModalVisible(false)}
          >
                <div className='modalDetail'>
                    { modalContent }
                </div>
            </Modal>
        );
    }
}
