<template>
  <div>
    <div class="toolbar">
      <RadioGroup v-model="scaleMode" type="button" @on-change="switchScaleMode">
        <Radio label="auto1">Auto1</Radio>
        <Radio label="auto2">Auto2</Radio>
        <Radio label="free">Free</Radio>
      </RadioGroup>
      <ButtonGroup>
        <Button type="warning" icon="ios-qr-scanner" @click="switchViewMode"></Button>
        <Button type="warning" icon="ios-remove" @click="zoomOut"></Button>
        <Button type="warning" icon="ios-add" @click="zoomIn"></Button>
        <Button type="primary" icon="ios-play" @click="playAnime"></Button>
        <Button type="primary" icon="ios-pause" @click="pauseAnime"></Button>
        <Button type="info" icon="ios-arrow-back" @click="wheelDelta -= 3"></Button>
        <Button type="info" icon="ios-arrow-forward" @click="wheelDelta += 3"></Button>
      </ButtonGroup>
    </div>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="board" @dblclick="switchViewMode"
      @wheel="wheel" @mousedown="startMove" @mousemove="doMove" @mouseup="stopMove" @mouseout="stopMove"></canvas>
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
      scale: 100,
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
        explorer.resetLocation();
        explorer.dirty = true;
      } else { this.viewMode = false; }
    },
    switchScaleMode() {
      if (this.scaleMode === 'free') explorer.scale = 100;
      if (explorer.image) explorer.dirty = true;
    },
    wheel(event) {
      if (!event.ctrlKey) {
        this.wheelDelta += event.deltaY;
      } else {
        event.preventDefault();
        if (explorer.image) {
          if (event.deltaY > 0 && explorer.scale > 25) {
            explorer.scale -= 25;
            explorer.dirty = true;
          }
          else if (event.deltaY < 0 && explorer.scale < 200) {
            explorer.scale += 25;
            explorer.dirty = true;
          }
        }
      }
    },
    startMove(event) {
      if (!explorer.image || this.scaleMode === 'auto1') return;
      explorer.x0 = event.clientX;
      explorer.y0 = event.clientY;
      explorer.moving = true;
    },
    doMove(event) {
      if (!explorer.image || !explorer.moving || this.scaleMode === 'auto1') return;
      explorer.x1 = event.clientX;
      explorer.y1 = event.clientY;
      explorer.dirty = true;
    },
    stopMove(event) {
      if (!explorer.image || !explorer.moving || this.scaleMode === 'auto1') return;
      let width = this.canvasWidth, height = this.canvasHeight;
      if (!this.viewMode) width -= 500;
      let rect = explorer.getPaintArea(this.scaleMode, width, height);
      explorer.ox = rect[0] > 0 ? 0 : rect[0];
      explorer.oy = rect[1] > 0 ? 0 : rect[1];
      explorer.x0 = 0;
      explorer.y0 = 0;
      explorer.x1 = 0;
      explorer.y1 = 0;
      explorer.moving = false;
    },
    zoomOut() {
      if (explorer.image && explorer.scale > 25) {
        explorer.scale -= 25;
        explorer.dirty = true;
      }
    },
    zoomIn() {
      if (explorer.image && explorer.scale < 200) {
        explorer.scale += 25;
        explorer.dirty = true;
      }
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
      let rect = explorer.getPaintArea(this.scaleMode, width, height);
      if (this.viewMode) {
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      } else {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      }
      this.ctx.drawImage(image, 0, 0, image.width, image.height, ...rect);
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