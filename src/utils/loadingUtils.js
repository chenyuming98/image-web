import Vue from 'vue'

// loading框设置局部刷新，且所有请求完成后关闭loading框
let loading
let needLoadingRequestCount = 0 // 声明一个对象用于存储请求个数
function startLoading (targetdq) {
  loading = Vue.prototype.$loading({
    lock: true,
    text: '努力加载中...',
    background: 'rgba(255,255,255,.4)',
    target: document.querySelector(targetdq) // 设置加载动画区域
  })
}

function endLoading () {
  loading.close()
}
export function showLoading () {
  if (needLoadingRequestCount === 0) {
    startLoading('loadingtext')
  }
  needLoadingRequestCount++
}
export function hideLoading () {
  if (needLoadingRequestCount <= 0) return
  needLoadingRequestCount--
  if (needLoadingRequestCount === 0) {
    setTimeout(()=>{   //设置延迟执行
      endLoading()
    },250);
  }
}

export default {
  showLoading,
  hideLoading
}
