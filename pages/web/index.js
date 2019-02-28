/*
 * 
 * @create 2017-11-10
 * @author Ma 
 * 
 */
Page({
  data: {
    url: '',
    show: false,
  },
  onLoad: function(options) {
    console.log(options, 'options')
    if (options.module == 'sign') {
      var url = options.domain + '?' + decodeURIComponent(options.params) + '&uid=' + options.mid;
    } else if (options.test) {
      var url = options.url + "?goodsId=" + options.goodsId + '&userId=' + options.userId+'&openid='+options.openid+'&title='+options.title
      console.log(url, 'ur2l')
    } else {
      var url = decodeURIComponent(options.url);
    }
    console.log(url);
    var $this = this;
    $this.setData({
      url: url,
      show: true,
    })
  }
})