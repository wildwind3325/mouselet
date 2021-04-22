<template>
  <div style="height: calc(100vh - 80px); overflow: auto;">
    <Form :label-width="150">
      <FormItem label="Base Dir">
        <Input type="text" v-model="kvs.base_dir">
        </Input>
      </FormItem>
      <FormItem label="Exhentai Proxy">
        <Input type="text" v-model="kvs.eh_proxy_addr" placeholder="http://127.0.0.1:1080">
        </Input>
      </FormItem>
      <FormItem label="Exhentai Account">
        <Input type="text" v-model="kvs.eh_account">
        </Input>
      </FormItem>
      <FormItem label="Exhentai Password">
        <Input type="password" v-model="kvs.eh_password">
        </Input>
      </FormItem>
      <FormItem label="Pixiv Proxy">
        <Input type="text" v-model="kvs.px_proxy_addr" placeholder="http://127.0.0.1:1080">
        </Input>
      </FormItem>
      <FormItem label="Pixiv Account">
        <Input type="text" v-model="kvs.px_account">
        </Input>
      </FormItem>
      <FormItem label="Pixiv Password">
        <Input type="password" v-model="kvs.px_password">
        </Input>
      </FormItem>
      <FormItem label="Inkbunny Proxy">
        <Input type="text" v-model="kvs.ib_proxy_addr" placeholder="http://127.0.0.1:1080">
        </Input>
      </FormItem>
      <FormItem label="Inkbunny Account">
        <Input type="text" v-model="kvs.ib_account">
        </Input>
      </FormItem>
      <FormItem label="Inkbunny Password">
        <Input type="password" v-model="kvs.ib_password">
        </Input>
      </FormItem>
      <FormItem label="Archive Single">
        <Input type="number" v-model="kvs.archive_single">
        </Input>
      </FormItem>
      <FormItem label="Archive Threshhold">
        <Input type="number" v-model="kvs.archive_all">
        </Input>
      </FormItem>
      <FormItem>
        <Button type="primary" :loading="submitting" @click="onSubmit">Submit</Button>
      </FormItem>
    </Form>
  </div>
</template>

<script>
import config from '../api/config';
export default {
  name: 'Config',
  props: {
    actived: Boolean,
    options: Object
  },
  data() {
    return {
      kvs: {
        base_dir: '',
        eh_proxy_addr: '',
        eh_account: '',
        eh_password: '',
        px_proxy_addr: '',
        px_account: '',
        px_password: '',
        ib_proxy_addr: '',
        ib_account: '',
        ib_password: '',
        archive_single: '4',
        archive_all: '100'
      },
      submitting: false
    };
  },
  mounted() {
    for (let key in this.kvs) {
      this.kvs[key] = config.get(key.toUpperCase());
    }
  },
  methods: {
    async onSubmit() {
      this.submitting = true;
      try {
        let names = [], values = [];
        for (let key in this.kvs) {
          if (config.get(key.toUpperCase()) !== this.kvs[key]) {
            names.push(key.toUpperCase());
            values.push(this.kvs[key]);
          }
        }
        let res = await this.$http.post('/api/common/config/save', {
          names: names,
          values: values
        });
        if (!res.data.success) {
          this.$Message.error('Save failed: ' + res.data.message);
        } else {
          for (let i = 0; i < names.length; i++) config.set(names[i], values[i]);
          this.$Message.success('Save done.');
        }
      } catch (err) {
        this.$Message.error('Save failed: ' + err.message);
      }
      this.submitting = false;
    }
  }
};
</script>