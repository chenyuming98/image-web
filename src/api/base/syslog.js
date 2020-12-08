import {createAPI} from '@/utils/request'

export const list = data => createAPI('/system/sysLog', 'get', data);
export const batchRemove = data => createAPI(`/system/sysLog/deletes`, 'post', data);

