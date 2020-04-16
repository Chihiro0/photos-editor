# photos-editor

>基于vue 2.x 的图片编辑合成组件

>Photo editing and composition component based on Vue 2.x


## Project setup
```
npm install photos-editor --save
```

## Import photos-editor
In main.js:
```

import photosEditor from 'photos-editor'

Vue.use(photosEditor)
```

## Example
```
<!-- template -->
<Photos-editor @toolFn="getState" :imgData="imgInfo" :bgData="bgImg"></Photos-editor>
<div @click="joinImg">join</div>

<script>
export default {
  data() {
    return {
      bgImg: require('Image path'),
      imgInfo: {
        img: ''
      }
    }
  },
  methods: {
    getState(resqult) {
      if (resqult.state === 'start') {
        console.log('Start generating pictures')
      }
      if (resqult.state === 'finish') {
        console.log('Generation end')
        console.log(resqult.url)
      }
    },
    joinImg() {
      this.imgInfo.img = require('Image path')
    }
  }
}
</script>
```

## Attribute
Attribute|Description|Type
:-:|:-:|:-:
imgData|Inserted image|object
bgData|Background picture|String

## Events
events|Description|Return Value
:-:|:-:|:-:
stateChange|result state and url|resqult.state/resqult.url