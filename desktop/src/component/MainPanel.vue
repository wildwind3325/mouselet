<template>
  <div>
    <div>
      <ButtonGroup>
        <Button type="primary" icon="ios-arrow-round-up" @click="up">Up</Button>
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
    actived: Boolean
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
    if (!res.data.success) {
      this.$Message.error('初始化失败：' + res.data.message);
      return;
    }
    explorer.newPath = res.data.path;
    explorer.seperator = res.data.seperator;
    await this.refresh();
    this.updatePath();
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
      let str = explorer.path;
      if (explorer.zipFile) {
        str += explorer.zipFile + explorer.seperator;
        for (let i = 0; i < explorer.route.length; i++) {
          str += explorer.route[i] + explorer.seperator;
        }
      }
      this.path = str;
    },
    async refresh() {
      let res = await this.$http.post('/api/explorer/refresh', {
        path: explorer.newPath,
        zipFile: explorer.zipFile,
        route: explorer.newRoute
      });
      if (!res.data.success) {
        this.$Message.error('获取失败：' + res.data.message);
        return;
      }
      explorer.path = explorer.newPath;
      if (explorer.zipFile) explorer.route = explorer.newRoute;
      this.updatePath();
      explorer.folders = res.data.folders;
      explorer.files = res.data.files;
      this.selectedIndex = -1;
      this.selected = ''
      this.items = [];
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
      if (this.path === '' || (this.path === '/' && !explorer.zipFile) || this.fetching) return;
      if (explorer.zipFile) {
      }
      let folder = this.path.substr(0, this.path.length - 1);
      this.refresh(this.path.substr(0, folder.lastIndexOf(explorer.seperator) + 1));
    },
    highlight(row, index) {
      if (this.selectedIndex === index) return 'ivu-table-row-highlight';
      return '';
    },
    navigate(row, index) {
      if (index >= explorer.folders.length || this.fetching) return;
      this.refresh(this.path + explorer.folders[index] + explorer.seperator);
    },
    select(row, index) {
      if (this.selectedIndex === index || this.fetching) return;
      this.selectedIndex = index;
      this.selected = '';
      if (row.size > 0 && explorer.isImage(row.name)) {
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
        let res = await this.$http.post('/api/explorer/image', { file: this.path + this.selected });
        if (res.data.success) {
          if (res.data.ugoira) {
            await explorer.setUgoira(res.data.ugoira);
          } else if (res.data.images) {
            await explorer.setAnime(res.data.images);
          } else {
            await explorer.setImage(res.data.image);
          }
          return;
        }
      } catch (err) {
      } finally {
        if (current == this.selected) this.selected = '';
        this.fetching = false;
      }
      explorer.clear(true);
    }
  }
};
</script>