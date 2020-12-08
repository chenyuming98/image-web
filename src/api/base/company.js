import {createAPI} from '@/utils/request'

export const getTreeList = data => createAPI('/organization/company/findCompanyTreeList', 'get', data);
export const add = data => createAPI('/organization/company', 'post', data);
export const update = data => createAPI(`/organization/company/${data.companyId}`, 'put', data);
export const remove = data => createAPI(`/organization/company/${data.id}`, 'delete', data);
export const batchRemove = data => createAPI(`/organization/company/deletes`, 'post', data);
