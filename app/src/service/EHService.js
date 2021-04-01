var cheerio = require('cheerio');
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

  async init(gallery, cookie, proxy) {
    try {
      let res = http.get(gallery, {
        cookie: cookie,
        proxy: proxy
      });
      let pg = cheerio.load(res.body);
      let total = parseInt(pg('td.gdt2').eq(5).text().split(' ')[0]);
      let mask = Math.max(total.toString().length, 2);
      let page = 0;
      let list = new Array();
      while (true) {
        if (page > 0) {
          res = await http.get(gallery + '?p=' + page, {
            cookie: cookie,
            proxy: proxy
          });
          pg = cheerio.load(res.body);
        }
        pg('div#gdt').find('a').each((i, elem) => {
          list.push(cheerio(elem).attr('href'));
        });
        let pager = pg('p.gpc').first().text().split(' ');
        if (pager[3] == pager[5]) {
          break;
        }
        page++;
      }
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  }
}

module.exports = new EHService();