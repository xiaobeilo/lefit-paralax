import Vue from 'vue'
import App from './App.vue'
import parallax from './parallax'

Vue.use(parallax.install)
new Vue({
  el: '#app',
  render: h => h(App)
})
