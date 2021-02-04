<template>
  <div>
    <Form :label-width="80">
      <FormItem label="Account">
        <Input type="text" v-model="account" placeholder="Account">
        </Input>
      </FormItem>
      <FormItem label="Password">
        <Input type="password" v-model="password" placeholder="Password">
        </Input>
      </FormItem>
      <FormItem>
        <Button type="primary">Login</Button>
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
      account: '',
      password: ''
    };
  }
};
</script>