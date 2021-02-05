<template>
  <div>
    <Tag checkable color="primary" :checked="false">标签一</Tag>
    <Tag checkable color="success" :checked="false">标签二</Tag>
    <Tag checkable color="error" :checked="false">标签三</Tag>
    <Tag checkable color="warning" :checked="false">标签四</Tag>
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
    };
  }
};
</script>