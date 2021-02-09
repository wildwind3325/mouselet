<template>
  <div style="height: calc(100vh - 80px); overflow: auto;">
    <Form :label-width="150">
      <FormItem label="Base Dir">
        <Input type="text" v-model="base_dir">
        </Input>
      </FormItem>
      <FormItem label="Exhentai Proxy">
        <Input type="text" v-model="eh_proxy_addr" placeholder="http://127.0.0.1:1080">
        </Input>
      </FormItem>
      <FormItem label="Exhentai Account">
        <Input type="text" v-model="eh_account">
        </Input>
      </FormItem>
      <FormItem label="Exhentai Password">
        <Input type="password" v-model="eh_password">
        </Input>
      </FormItem>
      <FormItem label="Pixiv Proxy">
        <Input type="text" v-model="px_proxy_addr" placeholder="http://127.0.0.1:1080">
        </Input>
      </FormItem>
      <FormItem label="Pixiv Account">
        <Input type="text" v-model="px_account">
        </Input>
      </FormItem>
      <FormItem label="Pixiv Password">
        <Input type="password" v-model="px_password">
        </Input>
      </FormItem>
      <FormItem label="Inkbunny Proxy">
        <Input type="text" v-model="ib_proxy_addr" placeholder="http://127.0.0.1:1080">
        </Input>
      </FormItem>
      <FormItem label="Inkbunny Account">
        <Input type="text" v-model="ib_account">
        </Input>
      </FormItem>
      <FormItem label="Inkbunny Password">
        <Input type="password" v-model="ib_password">
        </Input>
      </FormItem>
      <FormItem label="Archive Single">
        <Input type="number" v-model="archive_single">
        </Input>
      </FormItem>
      <FormItem label="Archive Threshhold">
        <Input type="number" v-model="archive_all">
        </Input>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="onSubmit">Submit</Button>
      </FormItem>
    </Form>
  </div>
</template>

<script>
export default {
  name: 'Config',
  props: {
    actived: Boolean,
    options: Object
  },
  data() {
    return {
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
    };
  },
  methods: {
    onSubmit() {
    }
  }
};
</script>