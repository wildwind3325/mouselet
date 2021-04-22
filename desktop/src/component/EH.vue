<template>
  <div>
    <Form :label-width="80">
      <FormItem label="Path">
        <Input type="text" v-model="save_path" :disabled="working">
        </Input>
      </FormItem>
      <FormItem label="Url">
        <Input v-model="url" :disabled="working" placeholder="https://exhentai.org/g/0000000/0000000000/">
        </Input>
      </FormItem>
      <FormItem label="From">
        <Input v-model="from" :disabled="working" placeholder="1">
        </Input>
      </FormItem>
      <FormItem label="To">
        <Input v-model="to" :disabled="working">
        </Input>
      </FormItem>
      <FormItem label="Indexing">
        <i-switch v-model="indexing" :disabled="working" />
      </FormItem>
      <FormItem label="Medium">
        <i-switch v-model="medium" :disabled="working" />
      </FormItem>
      <div>
        <Button type="primary" :loading="working" @click="download(false)">Download</Button>
        <Button :disabled="!working" style="margin-left: 5px;" @click="cancel">Cancel</Button>
        <Button type="warning" :loading="working" style="margin-left: 5px;" @click="download(true)">Resume</Button>
        <Button type="info" :loading="working" style="margin-left: 5px;" @click="login">Login</Button>
        <Button type="success" style="margin-left: 5px;" @click="showConsole = true">Console</Button>
      </div>
      <FormItem label="Progress">
        <Progress :percent="percent" />
      </FormItem>
      <div>
        {{ message }}
      </div>
    </Form>
    <Drawer title="Console" v-model="showConsole" width="500">
      <p v-for="(item, index) in logs" :key="index">{{ item }}</p>
    </Drawer>
  </div>
</template>

<script>
import config from '../api/config';
import explorer from '../api/explorer';
export default {
  name: 'EH',
  props: {
    actived: Boolean,
    options: Object
  },
  data() {
    return {
      save_path: '',
      url: '',
      items: [],
      percent: 0,
      from: '',
      to: '',
      indexing: false,
      medium: false,
      working: false,
      cancel_flag: false,
      message: 'Ready',
      showConsole: false,
      logs: []
    };
  },
  mounted() {
    this.save_path = explorer.getPath();
  },
  methods: {
    async download(skip_init) {
      if (!this.save_path || !this.url) {
        this.$Message.error('Save path or url is empty.');
        return;
      }
      let id = config.get('EH_ID');
      let hash = config.get('EH_HASH');
      if (!id || !hash) {
        await this.login();
        id = config.get('EH_ID');
        hash = config.get('EH_HASH');
        if (!id || !hash) {
          this.$Message.error('No login info found.');
          return;
        }
      }
      let cookie = 'ipb_member_id=' + id + ';ipb_pass_hash=' + hash + ';';
      let proxy = config.get('EH_PROXY_ADDR');
      this.working = true;
      try {
        if (!skip_init) {
          this.logs.push('Begin init.');
          let res = await this.$http.post('/api/eh/init', {
            url: this.url,
            cookie: cookie,
            proxy: proxy
          });
          if (!res.data.success) {
            this.$Message.error('Init failed: ' + res.data.message);
            this.logs.push('Init failed: ' + res.data.message);
            return;
          }
          this.logs.push('Init done.');
          this.items = res.data.list;
        }
        let mask = Math.max(this.items.length.toString().length, 2);
        this.percent = 0;
        let from = parseInt(this.from);
        let to = parseInt(this.to);
        if (isNaN(from) || from < 1 || from > this.items.length) {
          from = 1;
        }
        if (isNaN(to) || to < from || to > this.items.length) {
          to = this.items.length;
        }
        this.from = from.toString();
        this.to = to.toString();
        for (let i = 0; i < this.items.length; i++) {
          if (i < from - 1 || i >= to) continue;
          if (this.cancel_flag) {
            this.$Message.info('Download canceled.');
            this.logs.push('Download canceled.');
            break;
          }
          this.from = (i + 1).toString();
          let prefix = '';
          if (this.indexing) {
            prefix = this.num2mask(i + 1, mask) + '_';
          }
          res = await this.$http.post('/api/eh/download', {
            path: this.save_path,
            item: this.items[i],
            prefix: prefix,
            medium: this.medium,
            cookie: cookie,
            proxy: proxy
          });
          this.items[i] = res.data.item;
          if (!res.data.success) {
            this.$Message.error('Download failed: ' + res.data.message);
            this.logs.push('Download failed: ' + res.data.message);
            break;
          }
          this.percent = parseInt((i + 1) / this.items.length * 100);
          this.logs.push('Download completed: ' + res.data.item.name + '.');
        }
      } catch (err) {
        this.$Message.error('Download failed: ' + err.message);
        this.logs.push('Download failed: ' + err.message);
      } finally {
        this.working = false;
      }
    },
    cancel() {
      this.cancel_flag = true;
    },
    async login() {
      let account = config.get('EH_ACCOUNT');
      let password = config.get('EH_PASSWORD');
      let proxy = config.get('EH_PROXY_ADDR');
      if (!account || !password) {
        this.$Message.error('No account or password found.');
        return;
      }
      this.working = true;
      this.logs.push('Begin login.');
      try {
        let res = await this.$http.post('/api/eh/login', {
          account: account,
          password: password,
          proxy: proxy
        });
        if (!res.data.success) {
          this.$Message.error('Login failed: ' + res.data.message);
          this.logs.push('Login failed: ' + res.data.message);
        } else {
          await this.$http.post('/api/common/config/save', {
            names: ['EH_ID', 'EH_HASH'],
            values: [res.data.ipb_member_id, res.data.ipb_pass_hash]
          });
          config.set('EH_ID', res.data.ipb_member_id);
          config.set('EH_HASH', res.data.ipb_pass_hash);
          this.$Message.success('Login done.');
          this.logs.push('Login done.');
        }
      } catch (err) {
        this.$Message.error('Login failed: ' + err.message);
        this.logs.push('Login failed: ' + err.message);
      }
      this.working = false;
    },
    num2mask(value, mask) {
      let ret = value.toString();
      for (let i = 0; i < mask - value.toString().length; i++) {
        ret = '0' + ret;
      }
      return ret;
    }
  }
};
</script>