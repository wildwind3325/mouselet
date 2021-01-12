class Explorer {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  path = '';
  newPath = '';
  seperator = '';
  folders = [];
  files = [];
  zipFile = '';
  route = [];
  newRoute = [];

  loading = false;
  dirty = false;
  /** @type {Image} */
  image = null;
  /** @type {HTMLCanvasElement} */
  canvas = null;
  /** @type {CanvasRenderingContext2D} */
  ctx = null;
  playing = true;
  forward = true;
  total = 0;
  current = 0;
  images = [];
  delays = [];
  timer = 0;

  isZip(name) {
    if (name.lastIndexOf('.') < 0) return false;
    let ext = name.substr(name.lastIndexOf('.')).toLowerCase();
    return ext === '.zip';
  }

  exts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.frames'];
  isImage(name) {
    if (name.lastIndexOf('.') < 0) return false;
    let ext = name.substr(name.lastIndexOf('.')).toLowerCase();
    if (this.exts.indexOf(ext) < 0) return false;
    return true;
  }

  setImage(data) {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.onload = () => {
        if (image.width === 0 || image.height === 0) {
          this.image = null;
          this.dirty = true;
          resolve(false);
        } else {
          this.image = image;
          this.dirty = true;
          resolve(true);
        }
      };
      image.onerror = () => {
        this.image = null;
        this.dirty = true;
        resolve(false);
      };
      image.src = data;
    });
  }

  setAnime(list) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      let done = 0;
      this.total = list.length;
      this.current = 0;
      this.timer = 0;
      for (let i = 0; i < this.total; i++) {
        let data = Buffer.from(list[i].data, 'base64');
        this.canvas.width = list[i].width;
        this.canvas.height = list[i].height;
        this.ctx.putImageData(new ImageData(Uint8ClampedArray.from(data), list[i].width, list[i].height), 0, 0);
        let image = new Image();
        image.index = i;
        this.images.push(image);
        this.delays.push(list[i].delay);
        image.onload = () => {
          done++;
          if (done === this.total) {
            this.selectFrame();
            this.loading = false;
            resolve();
          }
        };
        image.onerror = () => {
          done++;
          this.images[image.index] = null;
          if (done === this.total) {
            this.selectFrame();
            this.loading = false;
            resolve();
          }
        };
        image.src = this.canvas.toDataURL();
      }
    });
  }

  setUgoira(ugoira) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      let done = 0;
      this.total = ugoira.images.length;
      this.current = 0;
      this.delays = ugoira.delays;
      this.timer = 0;
      for (let i = 0; i < this.total; i++) {
        let image = new Image();
        image.index = i;
        this.images.push(image);
        image.onload = () => {
          done++;
          if (done === this.total) {
            this.selectFrame();
            this.loading = false;
            resolve();
          }
        };
        image.onerror = () => {
          done++;
          this.images[image.index] = null;
          if (done === this.total) {
            this.selectFrame();
            this.loading = false;
            resolve();
          }
        };
        image.src = ugoira.images[i];
      }
    });
  }

  clear(redraw) {
    this.total = 0;
    this.current = 0;
    this.images = [];
    this.delays = [];
    this.timer = 0;
    if (this.image !== null) {
      this.image = null;
      this.dirty = redraw;
    }
  }

  update(ms) {
    if (this.images.length === 0 || !this.playing || this.loading) return;
    this.timer += ms;
    if (this.timer >= this.delays[this.current]) {
      this.dirty = true;
    }
    while (this.timer >= this.delays[this.current]) {
      this.timer -= this.delays[this.current];
      if (this.forward) {
        this.current++;
        if (this.current === this.total) {
          this.current = 0;
        }
      } else {
        this.current--;
        if (this.current < 0) {
          this.current = this.total - 1;
        }
      }
    }
    if (this.dirty) this.selectFrame();
  }

  selectFrame() {
    this.dirty = true;
    this.playing = true;
    for (let i = 0; i < this.images.length; i++) {
      let index = (this.current + i) % this.total;
      if (this.images[index]) {
        this.image = this.images[index];
        return;
      }
    }
    this.image = null;
  }
}

export default new Explorer();