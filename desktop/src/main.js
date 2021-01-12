import Vue from 'vue';
import App from './App';
import ViewUI from 'view-design';
import locale from 'view-design/dist/locale/en-US';
import axios from 'axios';
import './api/enhance';
import 'view-design/dist/styles/iview.css';
import './main.css';

Vue.config.productionTip = false;
Vue.use(ViewUI, { locale });
Vue.prototype.$http = axios;
Vue.prototype.$bus = new Vue();

new Vue({
  render: h => h(App)
}).$mount('#app');