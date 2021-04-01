<template>
  <div>
    <Form :label-width="80">
      <FormItem label="Path">
        <Input type="text" v-model="save_path" :disabled="working">
        </Input>
      </FormItem>
      <FormItem label="Url">
        <Input v-model="url" :disabled="working">
        </Input>
      </FormItem>
      <FormItem label="From">
        <Input v-model="from" :disabled="working">
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
      <FormItem>
        <Button type="primary" :loading="working" @click="download">Download</Button>
        <Button :disabled="!working" style="margin-left: 5px;" @click="cancel">Cancel</Button>
        <Button type="warning" :loading="working" style="margin-left: 5px;" @click="resume">Resume</Button>
        <Button type="info" :loading="working" style="margin-left: 5px;" @click="login">Login</Button>
      </FormItem>
      <FormItem label="Progress">
        <Progress :percent="0" :status="status" />
      </FormItem>
      <FormItem>
        {{ message }}
      </FormItem>
    </Form>
  </div>
</template>

<script>
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
      from: '',
      to: '',
      indexing: false,
      medium: false,
      working: false,
      status: '',
      message: 'Ready'
    };
  },
  methods: {
    download() {
      this.working = true;
    },
    cancel() {
      this.working = false;
    },
    resume() {
      this.working = true;
    },
    login() {
      this.working = true;
    }
  }
};
</script>