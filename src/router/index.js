import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Index from '../components/Index.vue'
import homePage from '../components/module-home/home.vue'
import userPage from '../components/module-system/user/index.vue'
import rolePage from '../components/module-system/role/index.vue'
import permPage from '../components/module-system/permission/index.vue'
import dictionaryPage from '../components/module-system/dictionary/index.vue'
import companyPage from '../components/module-company/company/index.vue'
import employeePage from '../components/module-company/employee/index.vue'
import sysLogPage from '../components/module-system/syslog/index.vue'

Vue.use(VueRouter);

const routes = [
  // { path: '/', redirect:'/login'},
  { path: '/', redirect:'/index'},
  { path: '/login' , component: Login},
  { path: '/index' , component: Index,redirect:'/homepage'
    ,children:[
      { path: '/homepage',component: homePage},
      { path: '/userpage',component: userPage},
      { path: '/rolepage',component: rolePage},
      { path: '/permpage',component: permPage},
      { path: '/companypage',component: companyPage},
      { path: '/dictionarypage',component: dictionaryPage},
      { path: '/syslogpage',component: sysLogPage},
      { path: '/employee',component: employeePage},
    ]},
];

const router = new VueRouter({
  mode: 'history',
  routes
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  console.log('navigation-guards');
  // to: Route: 即将要进入的目标 路由对象
  // from: Route: 当前导航正要离开的路由
  // next: Function: 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
  // 是否登录
  let isLogin = window.localStorage.getItem("accessToken");
  // 如果登录了
  if (isLogin) {
    // 如果已经登录的话,去登录页，返回首页
    if (to.path === '/login') {
      next('/index');
    }else{
      // 如果是其他页面的话，直接next()
      next();
    }
  } else {
    // 如果未登录，跳转登录页
    if (to.path === '/login') { // 如果是登录页面的话，直接next()
      next();
    } else { // 否则 跳转到登录页面
      next({
        path: '/login'
      });
    }
  }

});

export default router
