import {createAPI} from '@/utils/request'

export const list = data => createAPI('/system/dictionary', 'get', data);
export const allParentList = data => createAPI('/system/dictionary/allParent', 'get', data);
export const add = data => createAPI('/system/dictionary', 'post', data);
export const update = data => createAPI(`/system/dictionary/${data.dictionaryId}`, 'put', data);
export const remove = data => createAPI(`/system/dictionary/${data.id}`, 'delete', data);
export const batchRemove = data => createAPI(`/system/dictionary/deletes`, 'post', data);;

