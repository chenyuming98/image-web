import {createAPI,createFormAPI} from '@/utils/request'

export const list = data => createAPI('/image/file', 'get', data);
