import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import {showLoading,hideLoading} from '@/utils/loadingUtils';

// create an axios instance
const instance = axios.create({
  baseURL:  'http://www.tianyu.com', // api的base_url
  timeout: 15000 // request timeout
});

// request interceptor
instance.interceptors.request.use(
  config => {
    // Do something before request is sent
    let token = window.localStorage.getItem('accessToken');
    if (token) {
      // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
      config.headers['Authorization'] =  token
    }
    return config
  },
  error => {
    // Do something with request error
    Message.error('对不起，出错了');
    console.log(error); // for debug
    Promise.reject(error);
  }
);

export const createAPI = (url, method, data) => {
  let config = {};
  if (method === 'get') {
    config.params = data
  } else {
    config.data = data
    config.headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    }
    config.responseType = 'json'
  }
  return instance({
    url,
    method,
    ...config
  }).catch( (err) => {
    ElementUI.Message({message: "服务器错误！" ,type: "error"});
    console.log(err);
    hideLoading();
  })
};


// 文件导出
export const exportFileRequest = (url, params) => {
  let token = window.localStorage.getItem('accessToken');
  return axios({
    method: 'get',
    url: `http://www.tianyu.com${url}`,
    params: params,
    responseType: 'blob',
    headers: {
      'Authorization': token
    }
  });
};

export const createFormAPI = (url, method, data) => {
  let config = {}
  config.data = data
  config.headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  config.responseType = 'json'
  config.transformRequest = [
    function(data) {
      let ret = ''
      for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret
    }
  ]
  return instance({
    url,
    method,
    ...config
  })
}

