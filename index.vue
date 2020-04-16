<template>
  <div class="Photos-editor">
    <div class="save" @click="save" :style="'background-image: url(' + btnUrl + ')'">
      {{btnText}}
    </div>
    <div ref="content" class="content" @touchstart="contentClick" :style="'background-image:url(' + bgImg + '); height:' + contentHeight + 'px;'">
      <div
        class="img-item"
        v-for="(item, index) in imgObj"
        :key="item.id"
        @touchstart="startMove(index, $event)"
        @touchmove="onMove(index, $event)"
        @touchend="endMove(index)"
        :style="'width:' + (item.width + item.changeWidth >= 50 ? item.width + item.changeWidth : '50') + 'px;height:' + (item.width + item.changeWidth >= 50 ? item.height + item.changeHeight : (item.height + item.changeHeight) / (item.width + item.changeWidth) * 50 ) + 'px;top:' + (item.y - item.changeY) + 'px;left:' + (item.x - item.changeX) + 'px;z-index:' + item.zIndex + '; transform: rotate(' + (item.changeRotate) + 'deg);'">
          <img  :src="item.img" width="100%" alt="">
          <div v-show="index == focusIndex" class="item-border"></div>
          <img v-show="index == focusIndex" @click="removeItem(index)" class="item-remove" src="./images/close.png" />
          <img
            @touchstart="startChangeMove(index, $event)"
            @touchmove="onChangeMove(index, $event)"
            @touchend="endChangeMove(index)"
            v-show="index == focusIndex"
            class="item-change"
            src="./images/change.png" />
        </div>
    </div>
    <canvas ref="mycanvas" width="750" height="1400"></canvas>
    <div class="loading" v-show="loading">
      <div>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>手帐生成中...</p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Photos-editor',
  data() {
    return {
      loading: false,
      boxWidth: 0,
      boxHeight: 0,
      contentHeight: 0,
      imgId: 1,
      focusIndex: -1,
      imgObj: [], // 图片数组
      images: '',
      bgImg: '',
      siteStartX: 0, // 位置初始值
      siteStartY: 0, // 位置初始值
      zIndex: 1,
      sizeStartX: 0, // 大小初始值
      sizStartY: 0, // 大小初始值
      centreX: 0,
      centreY: 0,
      distance: 0, // 斜边长度
      myc: null,
      btnText: '',
      btnUrl: require('./images/save.png')
    }
  },
  props: {
    imgData: {
      type: Object,
      default: null
    },
    bgData: {
      type: String,
      default: null
    },
    btnImg: {
      type: String,
      default: null
    }
  },
  watch: {
    imgData(newData) {
      // console.log(newData.img)
      this.images = newData
      this.addImg()
      this.focusIndex = this.imgObj.length
    },
    bgData(newData) {
      // console.log(newData, oldData)
      this.bgImg = newData
    },
    btnImg(newData) {
      this.btnUrl = newData || require('./images/save.png')
    }
  },
  methods: {
    // 禁止页面划动
    pageTouch() {
      let bodyScroll=function(e){e.preventDefault();};
      // document.body.style.overflow = 'hidden'
      document.addEventListener('touchmove', bodyScroll)
    },
    // 点击空白取消编辑
    contentClick() {
      this.focusIndex = -1
    },
    // 添加图片
    addImg() {
      let img = new Image()
      img.onload = () => {
        this.zIndex += 1
        let imgAttr = {
          id: this.imgId,
          x: this.boxWidth / 2 - (img.width / 6),
          y: this.boxHeight / 2 - (img.height / 6),
          width: img.width / 3,
          height: img.height / 3,
          img: this.images.url,
          changeX: 0,
          changeY: 0,
          changeWidth: 0,
          changeHeight: 0,
          rotate: 0,
          oldRotate: 0,
          changeRotate: 0,
          zIndex: this.zIndex
        }
        this.imgObj.push(imgAttr)
        this.imgId += 1
      }
      img.src = this.images.url
      
    },
    // 触摸图片
    startMove(index, e) {
      e.stopPropagation() // 阻止事件冒泡
      this.focusIndex = index
      this.siteStartX = e.touches[0].clientX
      this.siteStartY = e.touches[0].clientY
      this.imgObj[index].zIndex = this.zIndex + 1
      this.zIndex += 1
    },
    // 移动图片
    onMove(index, e) {
      e.preventDefault()
      e.stopPropagation() // 阻止事件冒泡
      this.imgObj[index].changeX = this.siteStartX - e.touches[0].clientX
      this.imgObj[index].changeY = this.siteStartY - e.touches[0].clientY
      
    },
    // 移动结束
    endMove(index) {
      this.imgObj[index].x = this.imgObj[index].x - this.imgObj[index].changeX
      this.imgObj[index].y = this.imgObj[index].y - this.imgObj[index].changeY
      this.imgObj[index].changeX = 0
      this.imgObj[index].changeY = 0
    },
    // 移除图片
    removeItem(index) {
      this.imgObj.splice(index, 1)
    },
    // 图片大小开始
    startChangeMove(index, e) {
      e.stopPropagation()
      // 中心点
      this.centreX = this.imgObj[index].x + (this.imgObj[index].width / 2)
      this.centreY = this.imgObj[index].y + (this.imgObj[index].height / 2)

      // 大小改变
      this.sizeStartX = e.touches[0].clientX 
      this.sizeStartY = e.touches[0].clientY
      // 触摸点距中心点距离
      this.distance = Math.floor(Math.sqrt((this.centreX - this.sizeStartX) * (this.centreX - this.sizeStartX) + (this.centreY - this.sizeStartY) * (this.centreY - this.sizeStartY)))
      // 旋转改变
      // 初始角度
      this.imgObj[index].rotate = Math.atan2(this.sizeStartY - this.centreY, this.sizeStartX - this.centreX)
      // console.log(this.imgObj[index].rotate)
    },
    // 改变图片大小
    onChangeMove(index, e) {
      e.stopPropagation()
      e.preventDefault()
      // 中心点
      let atWidth = (this.imgObj[index].width + this.imgObj[index].changeWidth) >= 50 ? this.imgObj[index].width + this.imgObj[index].changeWidth : 50
      let atHeight = (this.imgObj[index].width + this.imgObj[index].changeWidth) >= 50 ? this.imgObj[index].height + this.imgObj[index].changeHeight : (this.imgObj[index].height + this.imgObj[index].changeHeight) / (this.imgObj[index].width + this.imgObj[index].changeWidth) * 50 
      this.centreX = this.imgObj[index].x + (atWidth / 2)
      this.centreY = this.imgObj[index].y + (atHeight / 2)

      let mChangeWidth = Math.floor(Math.sqrt((this.centreX - e.touches[0].clientX ) * (this.centreX - e.touches[0].clientX ) + (this.centreY - e.touches[0].clientY) * (this.centreY - e.touches[0].clientY))) - this.distance
      let ratio = this.imgObj[index].height / this.imgObj[index].width
      let mChangeHeight = mChangeWidth * ratio
      if ((mChangeWidth + this.imgObj[index].width) >= 50) {
        this.imgObj[index].changeY = (mChangeHeight / 2)
        this.imgObj[index].changeX = (mChangeWidth / 2)
      }
      // console.log(mChangeWidth)
      this.imgObj[index].changeWidth = mChangeWidth
      this.imgObj[index].changeHeight = mChangeHeight

      this.imgObj[index].changeRotate = Math.floor(((Math.atan2(e.touches[0].clientY - this.centreY, e.touches[0].clientX - this.centreX)) - this.imgObj[index].rotate) * 180 / Math.PI) + this.imgObj[index].oldRotate
      // console.log(this.imgObj[index].changeRotate)
    },
    // 改变图片大小结束
    endChangeMove(index) {
      this.imgObj[index].width = this.imgObj[index].width + this.imgObj[index].changeWidth
      this.imgObj[index].height = this.imgObj[index].height + this.imgObj[index].changeHeight
      this.imgObj[index].changeWidth = 0
      this.imgObj[index].changeHeight = 0

      this.imgObj[index].oldRotate = this.imgObj[index].changeRotate
    },
    // 保存
    save() {
      this.loading = true
      // this.$emit('stateChange', 'start') // 传递状态
      this.$emit('stateChange', {'state': 'start', 'url': ''}) // 传递状态
      this.$refs.content.style = 'display: none'
      this.myc = this.$refs.mycanvas
      let ctx = this.myc.getContext('2d')
      let bgImg = new Image()
      bgImg.setAttribute('crossOrigin', 'anonymous')
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, 750, 1400)
        let copyImgObj = this.imgObj.slice(0)
        function compare (property) {
          return function (a, b) {
            return a[property] - b[property]
          };
        }
        copyImgObj.sort(compare('zIndex'))
        this.drawImg(ctx, copyImgObj).then((res) => {
          if (res == 1) {
            let imgBase64 = this.myc.toDataURL("image/png")
            window.localStorage.setItem('resultImgBase64', imgBase64)
            this.loading = false
            // this.$emit('stateChange', 'finish') // 传递状态
            this.$emit('stateChange', {'state': 'finish', 'url': imgBase64}) // 传递状态
          }
        })
      }
      bgImg.src = this.bgImg

    },
    // 渲染图片
    drawImg(ctx, imgArr) {
      return new Promise((oresolve) => {
        let index = 0
        let arrLength = imgArr.length
        let x = 0
        let y = 0
        let width = 0
        let height = 0
        let rotate = 0
        if (imgArr.length > 0) {
          // 循环渲染函数
          let loopDraw = () => {
            new Promise((resolve) => {
              x = imgArr[index].x / (window.screen.width / 375) * 2
              y = imgArr[index].y / (window.screen.width / 375) * 1.9
              width = imgArr[index].width * 1.8
              height = imgArr[index].height * 1.7
              // rotate = imgArr[index].rotate * 180 / Math.PI
              rotate = imgArr[index].oldRotate
              // console.log('x' + x + ' width' + width + '   ' + rotate)
              let img = new Image()
              img.setAttribute('crossOrigin', 'anonymous')
              img.onload = () => {
                ctx.save()
                ctx.translate(x + (width / 2), y + (height / 2));
                ctx.rotate(rotate * Math.PI / 180)
                ctx.drawImage(img, x - (x + (width / 2)), y - (y + (height / 2)), width, height)
                ctx.restore()
                index += 1
                if (index >= arrLength) {
                  resolve(1) // 渲染完成
                } else {
                  resolve(0) // 继续渲染下一个
                }
              }
              img.src = imgArr[index].img
            }).then((res) => {
              if (res == 0) {
                loopDraw()
              } else {
                oresolve(1)
              }
            })
          }
          loopDraw()
        } else {
          oresolve(1)
        }
      })
    }
  },
  mounted() {
    this.bgImg = this.bgData
    this.contentHeight = (1400 / 750) * window.screen.width
    this.boxWidth = this.$refs.content.offsetWidth
    // this.boxHeight = this.$refs.content.offsetHeight
    this.boxHeight = this.contentHeight
    this.pageTouch()
  }
}
</script>
<style scoped>
.Photos-editor {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #383838;
  background-size: cover;
  background-position: left top;
  background-repeat: no-repeat;
}
.save {
  width: 80px;
  height: 37px;
  position: absolute;
  top: 0.53rem;
  right: 0;
  z-index: 99999;
  color: #fff;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.content {
  width: 100%;
  height: 100%;
  /* width: 375px;
  height: 100%; */
  position: absolute;
  left: 0;
  top: 0;
  /* background-color: #383838; */
  background-size: cover;
  background-position: left top;
  background-repeat: no-repeat;
  overflow: hidden;
}
.img-item {
  position: absolute;
  -webkit-transform-origin: center center;
  transform-origin: center center;
  user-select: none;
  transform: translateZ(0);
}
.item-border {
  width: 100%;
  height: 100%;
  border: 2px dashed #7D7D7D;
  opacity: 0.7;
  padding: 0.26rem;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.item-remove {
  width: 20px;
  position: absolute;
  left: -15px;
  top: -15px;
}
.item-change {
  width: 20px;
  position: absolute;
  right: -15px;
  bottom: -15px;
}
canvas {
  width: 100%;
  /* height: 100%; */
}
.loading {
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 999999;
  background-color: rgba(0, 0, 0, 1);
  left: 0;
  top: 0;
}
/* .loading img {
  width: 1rem;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: loading 1s infinite linear;
}
@keyframes loading {
  0% {
    transform: translate(-50%, -50%) rotate(0);
  }
  100% {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
} */
.loading p {
  font-size: 0.42rem;
  color: #AA955B;
  position: absolute;
  left: 50%;
  top: 56%;
  transform: translate(-50%);
}
.loading div {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
}
.loading span{
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-right: 5px;
  background: #fff;
  -webkit-animation: load 1.04s ease infinite;
}
.loading span:last-child{
    margin-right: 0px; 
}
@-webkit-keyframes load{
  0%{
    opacity: 1;
    -webkit-transform: scale(1.2);
  }
  100%{
    opacity: .2;
    -webkit-transform: scale(.2);
  }
}
.loading span:nth-child(1){
    -webkit-animation-delay:0.13s;
}
.loading span:nth-child(2){
    -webkit-animation-delay:0.26s;
}
.loading span:nth-child(3){
    -webkit-animation-delay:0.39s;
}
.loading span:nth-child(4){
    -webkit-animation-delay:0.52s;
}
.loading span:nth-child(5){
    -webkit-animation-delay:0.65s;
}
</style>
