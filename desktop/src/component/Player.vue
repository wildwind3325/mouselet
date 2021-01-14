<template>
  <div class="div-center" style="height: calc(100vh - 80px);">
    <video autoplay controls>
      <source :src="'/api/explorer/media?file=' + options.file">
    </video>
  </div>
</template>

<script>
export default {
  name: 'Player',
  props: {
    actived: Boolean,
    options: Object
  }
};
</script>