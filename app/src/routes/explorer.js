var cp = require('child_process');
var express = require('express');
var fs = require('fs');
var omggif = require('../api/omggif');
var file = require('../api/file');
var zip = require('../api/zip');

var router = express.Router();

router.post('/init', function (req, res, next) {
  let path, seperator;
  if (process.platform.startsWith('win')) {
    path = '';
    seperator = '\\';
  } else {
    path = '/';
    seperator = '/';
  }
  res.send({
    success: true,
    path: path,
    seperator: seperator
  });
});

router.post('/refresh', async function (req, res, next) {
  try {
    let path = req.body.path;
    let folders = [];
    let files = [];
    if (process.platform.startsWith('win') && path === '') {
      let stdout = cp.execSync('wmic logicaldisk get name').toString();
      folders = stdout.split('\r\r\n')
        .filter(value => /[A-Za-z]:/.test(value))
        .map(value => value.trim());
    } else {
      let list = fs.readdirSync(path, { withFileTypes: true });
      for (let i = 0; i < list.length; i++) {
        if (list[i].isDirectory()) {
          if (list[i].name.toUpperCase() !== '$RECYCLE.BIN' && list[i].name !== 'System Volume Information') {
            folders.push(list[i].name);
          }
        } else {
          try {
            let stat = fs.statSync(path + list[i].name);
            files.push({
              name: list[i].name,
              size: stat.size,
              fsize: file.getSizeString(stat.size),
              ctime: stat.ctime.format('yyyy-MM-dd HH:mm:ss')
            });
          } catch (err) { }
        }
      }
    }
    res.send({
      success: true,
      folders: folders,
      files: files
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

router.post('/image', async function (req, res, next) {
  try {
    let ext = file.getExtension(req.body.file);
    if (ext === '.frames') {
      let ugoira = await zip.loadUgoira(req.body.file);
      res.send({
        success: true,
        ugoira: ugoira
      });
      return;
    }
    let buffer = fs.readFileSync(req.body.file);
    let header = '';
    for (let i = 0; i < 6; i++) {
      if (buffer.length <= i) break;
      header += String.fromCharCode(buffer[i]);
    }
    if (header === 'GIF89a') {
      let reader = new omggif.GifReader(buffer);
      if (reader.numFrames() > 1) {
        let images = [];
        for (let i = 0; i < reader.numFrames(); i++) {
          let info = reader.frameInfo(i);
          let data = new Uint8ClampedArray(info.width * info.height * 4);
          reader.decodeAndBlitFrameRGBA(i, data);
          images.push({
            data: Buffer.from(data).toString('base64'),
            delay: (info.delay * 10) || 50,
            width: info.width,
            height: info.height
          });
        }
        res.send({
          success: true,
          images: images
        });
        return;
      }
    }
    res.send({
      success: true,
      image: 'data:' + file.getImageMime(req.body.file) + ';base64,' + Buffer.from(buffer).toString('base64')
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

router.post('/zip/open', async function (req, res, next) {
  try {
    await zip.open(req.body.file);
    res.send({ success: true });
  } catch (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

router.post('/zip/close', function (req, res, next) {
  zip.close();
  res.send({ success: true });
});

module.exports = router;