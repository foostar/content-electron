import {notification} from 'antd';

export default opt => store => next => async action => {
    if (action.payload && action.payload.error) {
        let description = '未知错误';
        let show = true;
        try {
            const {message, code} = action.payload.result.status;
            description = `[${code}]: ${message}`;
        } catch (err) {}

        show && notification.error({
            message: '错误',
            description
        });
    }
    delete action.error;
    return next(action);
};
