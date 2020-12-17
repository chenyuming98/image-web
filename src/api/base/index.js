import {createAPI,createFormAPI} from '@/utils/request'


export const labelInfo = data => createAPI(`/indexInfo/label`, 'get', data);
export const getStaticInfo = data => createAPI(`/indexInfo/getStaticInfo`, 'get', data);
