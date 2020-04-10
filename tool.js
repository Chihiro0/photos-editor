import photoEditor from './index.vue'

// console.log()
// tool.install  = Vue => Vue.component(tool.name, tool);
const photoEditor = {
  install: (Vue) => {
    Vue.component('photo-editor', photoEditor)
  }
}

export default photoEditor