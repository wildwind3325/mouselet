var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var http = require('../api/http');

class EHService {
  constructor() {
  }

  async login(account, password, proxy) {
    try {
      let res = await http.post('https://forums.e-hentai.org/index.php', {
        act: 'Login',
        CODE: '01',
        referer: 'act%3DLogin%26CODE%3D01',
        CookieDate: '1',
        UserName: account,
        PassWord: password,
        submit: 'Log+In'
      }, { proxy: proxy });
      let ipb_member_id = http.findCookie(res.headers['set-cookie'], 'ipb_member_id');
      let ipb_pass_hash = http.findCookie(res.headers['set-cookie'], 'ipb_pass_hash');
      if (!ipb_member_id || !ipb_pass_hash) {
        throw new Error('Login failed.');
      }
      return {
        success: true,
        ipb_member_id: ipb_member_id,
        ipb_pass_hash: ipb_pass_hash
      };
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  }

  async init(url, cookie, proxy) {
    try {
      let res = await http.get(url, {
        headers: { Cookie: cookie },
        proxy: proxy
      });
      let page = cheerio.load(res.body);
      let p = 0;
      let list = new Array();
      while (true) {
        if (p > 0) {
          res = await http.get(url + '?p=' + p, {
            headers: { Cookie: cookie },
            proxy: proxy
          });
          page = cheerio.load(res.body);
        }
        page('div#gdt').find('a').each((i, elem) => {
          list.push({ url: cheerio(elem).attr('href') });
        });
        let pager = page('p.gpc').first().text().split(' ');
        if (pager[3] == pager[5]) {
          break;
        }
        p++;
      }
      return {
        success: true,
        list: list
      };
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  }

  async download(path, item, prefix, medium, cookie, proxy) {
    try {
      if (!item.image) {
        let res = await http.get(item.url, {
          headers: { Cookie: cookie },
          proxy: proxy
        });
        let page = cheerio.load(res.body);
        let elem = page('div#i7 a');
        if (elem.length == 0 || medium) {
          item.image = page('img#img').attr('src');
          let name = page('div#i4').find('div').first().text();
          item.name = prefix + name.substring(0, name.indexOf(' '));
        } else {
          item.image = elem.first().attr('href').replace('&amp;', '&');
        }
      }
      if (!item.size) {
        let res = await http.get(item.image, {
          method: 'HEAD',
          headers: { Cookie: cookie },
          proxy: proxy
        });
        if (!item.name) {
          let name = res.headers['content-disposition'];
          item.name = prefix + name.substring(name.indexOf('=') + 1);
        }
        item.size = parseInt(res.headers['content-length']);
      }
      let fullname = path.join(path, item.name);
      if (fs.existsSync(fullname)) {
        return {
          success: true,
          item: item
        };
      }
      let data = await http.download(item.image, {
        headers: { Cookie: cookie },
        proxy: proxy
      });
      if (data.body.length !== item.size) {
        return {
          success: false,
          item: item,
          message: 'Download failed.'
        };
      } else {
        fs.writeFileSync(fullname, data.body);
        return {
          success: true,
          item: item
        };
      }
    } catch (err) {
      return {
        success: false,
        item: item,
        message: err.message
      };
    }
  }
}

module.exports = new EHService();