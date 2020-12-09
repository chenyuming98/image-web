import {createAPI,createFormAPI} from '@/utils/request'

export const imageFileList = data => createAPI('/image/imageFile', 'get', data);
export const fileList = data => createAPI('/image/file', 'get', data);
export const batchRemove = data => createAPI(`/image/deletes`, 'post', data);
