// The Vue build version to load with the `import` command 。
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueBus from 'vue-bus';
//配置axios
import axios from 'axios'
//引入JQ
import $ from 'jquery'
//引入echart
import echarts from 'echarts'
//将echarts引入到vue的原型中
Vue.prototype.$echarts = echarts
//导入字体图标
import './assets/fonts/iconfont.css'
//导入全局样式
import './assets/css/global.css'
//图标库
import iconPicker from 'e-icon-picker';
import 'e-icon-picker/dist/index.css';//基础样式
import 'e-icon-picker/dist/main.css'; //fontAwesome 图标库样式

Vue.config.productionTip = false;

// Vue使用ElementUI
Vue.use(ElementUI);
Vue.use(iconPicker);
Vue.prototype.$http = axios;
//配置请求的根路径
axios.defaults.baseURL = 'http://www.tianyu.com/';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
