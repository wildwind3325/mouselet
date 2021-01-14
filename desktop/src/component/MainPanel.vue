<template>
  <div>
    <div>
      <ButtonGroup>
        <Button type="primary" icon="ios-arrow-round-up" @click="up">Up</Button>
        <Button type="info" icon="ios-refresh" @click="refresh">Refresh</Button>
      </ButtonGroup>
    </div>
    <div>
      <Input v-model="path" readonly />
    </div>
    <Table border size="small" :height="height" :columns="columns" :data="items" :row-class-name="highlight"
      @on-row-dblclick="navigate" @on-row-click="select" @on-selection-change="setSelection">
    </Table>
    <div style="height: 31px; padding: 5px 0px;">Footer</div>
  </div>
</template>

<script>
import explorer from '../api/explorer';
export default {
  name: 'MainPanel',
  props: {
    actived: Boolean,
    options: Object
  },
  data() {
    return {
      path: '',
      height: 200,
      columns: [{
        type: 'selection',
        width: 60,
        align: 'center'
      }, {
        title: 'Name',
        key: 'name',
        width: 320
      }, {
        title: 'Size',
        key: 'fsize',
        width: 100
      }],
      items: [],
      selectedIndex: -1,
      selected: '',
      fetching: false,
      selection: []
    };
  },
  async mounted() {
    this.$bus.$on('resize', this.fixSize);
    this.fixSize();
    let res = await this.$http.post('/api/explorer/init');
    if (res.data.success) explorer.seperator = res.data.seperator;
    this.updatePath();
    await this.refresh();
    setInterval(this.getImage, 50);
    this.$bus.$on('wheel', this.wheel);
  },
  beforeDestroy() {
    this.$bus.$off('resize', this.fixSize);
    this.$bus.$off('wheel', this.wheel);
  },
  methods: {
    fixSize() {
      this.height = Math.floor(document.body.getBoundingClientRect().height) - 175;
    },
    updatePath() {
      let str = '';
      for (let i = 0; i < explorer.dirRoute.length; i++) {
        if (explorer.seperator === '\\' && i === 0) continue;
        str += explorer.dirRoute[i] + explorer.seperator;
      }
      if (explorer.zipFile) {
        str += explorer.zipFile + explorer.seperator;
        for (let i = 0; i < explorer.zipRoute.length; i++) {
          str += explorer.zipRoute[i] + explorer.seperator;
        }
      }
      this.path = str;
    },
    async refresh(target) {
      if (this.fetching) return;
      let newDirRoute = explorer.dirRoute, newZipFile = explorer.zipFile, newZipRoute = explorer.zipRoute;
      if (target === '..') {
        if (explorer.zipFile) {
          if (explorer.zipRoute.length > 0) {
            newZipRoute = explorer.zipRoute.slice(0, explorer.zipRoute.length - 1);
          } else {
            newZipFile = '';
            try {
              await this.$http.post('/api/explorer/zip/close');
            } catch (err) { }
          }
        } else {
          if (explorer.dirRoute.length > 1) {
            newDirRoute = explorer.dirRoute.slice(0, explorer.dirRoute.length - 1);
          } else { return; }
        }
      } else if (Number.isInteger(target)) {
        let item = this.items[target];
        if (explorer.zipFile) {
          if (target < explorer.folders.length) {
            newZipRoute = explorer.zipRoute.slice(0);
            newZipRoute.push(explorer.folders[target]);
          } else { return; }
        } else {
          if (target < explorer.folders.length) {
            newDirRoute = explorer.dirRoute.slice(0);
            newDirRoute.push(explorer.folders[target]);
          } else if (explorer.isZip(item.name)) {
            try {
              this.fetching = true;
              let zipRes = await this.$http.post('/api/explorer/zip/open', {
                file: this.path + item.name
              });
              if (!zipRes.data.success) {
                this.$Message.error('Open zip failed: ' + zipRes.data.message);
                return;
              }
            } catch (err) {
              this.$Message.error('Open zip failed: ' + err.message);
              return;
            } finally {
              this.fetching = false;
            }
            newZipFile = item.name;
          } else {
            if (explorer.isMedia(item.name)) {
              let file = explorer.dirRoute.join(explorer.seperator) + explorer.seperator + item.name;
              if (explorer.seperator === '\\') file = file.substr(1);
              this.$emit('tab-new', 'Player', 'Player', { file: file });
            }
            return;
          }
        }
      }
      let res = await this.$http.post('/api/explorer/refresh', {
        dirRoute: newDirRoute,
        zipFile: newZipFile,
        zipRoute: newZipRoute
      });
      if (!res.data.success) {
        this.$Message.error('Refresh failed: ' + res.data.message);
        if (target === '..') {
          explorer.dirRoute = newDirRoute;
          explorer.zipFile = newZipFile;
          explorer.zipRoute = newZipRoute;
          this.updatePath();
          explorer.folders = [];
          explorer.files = [];
          this.selectedIndex = -1;
          this.selected = ''
          this.items = [];
          this.selection = [];
        }
        return;
      }
      if (target === '..' || Number.isInteger(target)) {
        explorer.dirRoute = newDirRoute;
        explorer.zipFile = newZipFile;
        explorer.zipRoute = newZipRoute;
        this.updatePath();
      }
      explorer.folders = res.data.folders;
      explorer.files = res.data.files;
      this.selectedIndex = -1;
      this.selected = ''
      this.items = [];
      this.selection = [];
      for (let i = 0; i < explorer.folders.length; i++) {
        this.items.push({
          name: '[' + explorer.folders[i] + ']',
          size: 0,
          fsize: '',
          ctime: ''
        });
      }
      for (let i = 0; i < explorer.files.length; i++) {
        this.items.push(explorer.files[i]);
      }
      explorer.clear(true);
    },
    up() {
      this.refresh('..');
    },
    highlight(row, index) {
      if (this.selectedIndex === index) return 'ivu-table-row-highlight';
      return '';
    },
    navigate(row, index) {
      this.refresh(index);
    },
    select(row, index) {
      if (this.selectedIndex === index || this.fetching) return;
      this.selectedIndex = index;
      this.selected = '';
      if (row.size > 0 && (explorer.isImage(row.name) || (explorer.isUgoira(row.name) && !explorer.zipFile))) {
        explorer.clear(false);
        this.selected = row.name;
      } else {
        explorer.clear(true);
      }
    },
    wheel(delta) {
      if (delta > 0 && this.selectedIndex < this.items.length - 1) {
        this.select(this.items[this.selectedIndex + 1], this.selectedIndex + 1);
      } else if (delta < 0 && this.selectedIndex > 0) {
        this.select(this.items[this.selectedIndex - 1], this.selectedIndex - 1);
      }
    },
    setSelection(list) {
      this.selection = list;
    },
    async getImage() {
      if (this.fetching || !this.selected) return;
      let current = this.selected;
      try {
        this.fetching = true;
        let res = await this.$http.post('/api/explorer/image', {
          dirRoute: explorer.dirRoute,
          zipFile: explorer.zipFile,
          zipRoute: explorer.zipRoute,
          file: this.selected
        });
        if (res.data.success) {
          if (res.data.ugoira) {
            await explorer.setUgoira(res.data.ugoira);
          } else if (res.data.images) {
            await explorer.setAnime(res.data.images);
          } else {
            await explorer.setImage(res.data.image);
          }
          explorer.resetLocation();
          return;
        }
      } catch (err) {
        this.$Message.error('Get image failed: ' + err.message);
      } finally {
        if (current == this.selected) this.selected = '';
        this.fetching = false;
      }
      explorer.clear(true);
    }
  }
};
</script>