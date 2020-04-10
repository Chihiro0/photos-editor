import photoEditor from './index.vue'

// console.log()
// tool.install  = Vue => Vue.component(tool.name, tool);
const tool = {
  install: (Vue) => {
    Vue.component('Photos-editor', photoEditor)
  }
}

export default tool