import {createAPI,createFormAPI} from '@/utils/request'

export const imageFileList = data => createAPI('/image/imageFile', 'get', data);
export const fileList = data => createAPI('/image/file', 'get', data);
export const batchRemove = data => createAPI(`/image/deletes`, 'post', data);
export const trainSvmFile = data => createAPI(`/image/trainSvm`, 'post', data);
export const svmList = data => createAPI('/image/svmList', 'get', data);
export const testSvmFile = data => createAPI(`/image/svmTest`, 'post', data);
export const probabilityList = data => createAPI('/image/probabilityList', 'get', data);
export const deletesProbability = data => createAPI(`/image/deletesProbability`, 'post', data);
export const paramList = data => createAPI('/image/paramList', 'get', data);
export const code = data => createAPI('/system/dictionary/findCodeList', 'get', data);
export const svmInfoList = data => createAPI('/image/svmInfoList', 'get', data);
export const deletesSvmDatList = data => createAPI(`/image/deletesSvmList`, 'post', data);

