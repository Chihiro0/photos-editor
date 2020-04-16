# photos-editor

>基于vue 2.x 的图片编辑合成组件

>Photo editing and composition component based on Vue 2.x

[demo](http://res.xiaoxxx.com/test/m.xiaoxxx.com/202004164675073017b73e92789029.png)

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
<Photos-editor @stateChange="getState" :imgData="imgInfo" :bgData="bgImg" :btnImg="btnUrl"></Photos-editor>
<div @click="joinImg">join</div>

<script>
export default {
  data() {
    return {
      bgImg: require('Image path'),
      imgInfo: {
        img: ''
      },
      btnUrl: require('Image path')
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
btnUrl|button image|String

## Events
events|Description|Return Value
:-:|:-:|:-:
stateChange|result state and url|resqult.state/resqult.url