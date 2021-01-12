<template>
  <div>
    <div class="toolbar">
      <RadioGroup v-model="scaleMode" type="button" @on-change="switchScaleMode">
        <Radio label="auto1">Auto1</Radio>
        <Radio label="auto2">Auto2</Radio>
        <Radio label="free">Free</Radio>
      </RadioGroup>
      <ButtonGroup>
        <Button type="success" icon="ios-remove"></Button>
        <Button type="success" icon="ios-add"></Button>
        <Button type="primary" icon="ios-play" @click="playAnime"></Button>
        <Button type="primary" icon="ios-pause" @click="pauseAnime"></Button>
        <Button type="info" icon="ios-arrow-back" @click="wheelDelta -= 3"></Button>
        <Button type="info" icon="ios-arrow-forward" @click="wheelDelta += 3"></Button>
      </ButtonGroup>
    </div>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="board" @dblclick="switchViewMode"
      @wheel="wheel"></canvas>
    <div v-show="!viewMode" class="sider">
      <Tabs v-model="activeTab" type="card" :animated="false">
        <TabPane :label="item.lable" v-for="(item, index) in tabs" :key="index">
          <component :is="item.component" :actived="index ===  activeTab" @tab-close="tabClose">
          </component>
        </TabPane>
      </Tabs>
    </div>
  </div>
</template>

<script>
import explorer from './api/explorer';
import MainPanel from './component/MainPanel';
export default {
  name: 'App',
  components: {
    MainPanel
  },
  data() {
    return {
      viewMode: false,
      scaleMode: 'free',
      wheelDelta: 0,
      canvasWidth: 100,
      canvasHeight: 100,
      ctx: null,
      activeTab: 0,
      tabs: [{
        lable: 'Explorer',
        component: 'MainPanel'
      }]
    };
  },
  mounted() {
    window.onresize = () => {
      this.$bus.$emit('resize');
    };
    this.$bus.$on('resize', this.fixSize);
    this.fixSize();
    this.ctx = this.$refs.canvas.getContext('2d');
    setInterval(this.paint, 50);
  },
  beforeDestroy() {
    this.$bus.$off('resize', this.fixSize);
  },
  methods: {
    fixSize() {
      this.canvasWidth = Math.floor(document.body.getBoundingClientRect().width);
      this.canvasHeight = Math.floor(document.body.getBoundingClientRect().height) - 32;
      explorer.dirty = true;
    },
    tabClose() {
      this.activeTab -= 1;
      this.tabs.splice(this.activeTab + 1, 1);
    },
    switchViewMode() {
      if (explorer.image) {
        this.viewMode = !this.viewMode;
        explorer.dirty = true;
      }
    },
    switchScaleMode() {
      if (this.viewMode) explorer.dirty = true;
    },
    wheel(event) {
      this.wheelDelta += event.deltaY;
    },
    playAnime() {
      explorer.playing = true;
    },
    pauseAnime() {
      explorer.playing = false;
    },
    paint() {
      if (this.wheelDelta !== 0) {
        this.$bus.$emit('wheel', this.wheelDelta);
        this.wheelDelta = 0;
      }
      explorer.update(50);
      if (!explorer.dirty) return;
      explorer.dirty = false;
      if (!explorer.image) {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        return;
      }
      let image = explorer.image;
      let width = this.canvasWidth, height = this.canvasHeight;
      if (!this.viewMode) width -= 500;
      let sx = 0, sy = 0, swidth = image.width, sheight = image.height;
      let x = 0, y = 0, w = image.width, h = image.height;
      if (image.width > width || image.height > height) {
        if (width * image.height > height * image.width) {
          w = Math.floor(image.width * height / image.height);
          h = height;
        }
        else {
          w = width;
          h = Math.floor(image.height * width / image.width);
        }
      }
      if (width > w) {
        x = Math.floor((width - w) / 2);
      }
      if (height > h) {
        y = Math.floor((height - h) / 2);
      }
      if (this.viewMode) {
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      } else {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      }
      this.ctx.drawImage(image, sx, sy, swidth, sheight, x, y, w, h);
    }
  }
}
</script>

<style>
.board {
  width: 100vw;
  height: calc(100vh - 32px);
  position: absolute;
  top: 32px;
  left: 0px;
  display: block;
}
.toolbar {
  width: 100%;
  height: 32px;
  position: absolute;
  top: 0px;
  left: 0px;
  background-color: white;
}
.sider {
  width: 500px;
  height: calc(100vh - 32px);
  position: absolute;
  top: 32px;
  right: 0px;
  background-color: white;
}
</style>