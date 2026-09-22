import Vue from 'vue'
import './bootstrap'
import 'vue2-datepicker/index.css'

import App from './views/app.vue'
import store from './store'


const app = new Vue({
    el: '#app',
    store,
    components: { App }
});
