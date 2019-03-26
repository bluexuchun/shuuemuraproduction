/**
 *
 * order/index.js
 *
 * @create 2017-1-15
 * @author Young
 *
 * @update  Young 2017-02-04
 *
 */
var app = getApp(), 
core = app.requirejs('core'),
order = app.requirejs('biz/order');
var util = require('../../utils/util.js')
Page({
    data: {
        icons: app.requirejs('icons'),
        status: '',
        list:[],
        page:1,
        code: false,
        cancel:order.cancelArray,
        cancelindex:0
    },
    onLoad: function (options) {
       let $this = this
        app.checkAuth();
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            options: options,
            status: options.status || ''
        });
        app.url(options);
        $this.get_list();
    },
    get_list: function () {
      var $this = this;
      $this.setData({ loading: true });
      core.get('order/get_list', { page: $this.data.page, status: $this.data.status, merchid: 0 }, function (list) {
        console.log(list);
        if (list.error == 0) {
          list.list.map((v, i) => {
            v.price = parseInt(v.price)
          })
          $this.setData({ loading: false, show: true, total: list.total, empty: true });
          if (list.list.length > 0) {
            $this.setData({
              page: $this.data.page + 1,
              list: $this.data.list.concat(list.list)
            });
          }
          if (list.list.length < list.pagesize) {
            $this.setData({
              loaded: true
            });
          }
        } else {
          core.toast(list.message, 'loading')
        }
      }, $this.data.show);
    },

    get_updata_list: function () {
      var $this = this;
      $this.setData({ loading: true });
      core.get('order/get_list', { page: 1, status: $this.data.status, merchid: 0 }, function (list) {
        console.log(list);
        if (list.error == 0) {
          $this.setData({ loading: false, show: true, total: list.total, empty: true });
          if (list.list.length > 0) {
            $this.setData({
              list: list.list
            });
          }
        }
      });
    },
    selected: function (e) {
        var status = core.data(e).type;
        this.setData({
            list:[],
            page:1,
            status: status,
            empty: false
        });
        this.get_list();
    },
    onReachBottom:function(){
        if (this.data.loaded || this.data.list.length==this.data.total) {
            return;
        }
        this.get_list();
    },
    code: function (e) {
        var $this=this,orderid=core.data(e).orderid;
        core.post('verify/qrcode',{id:orderid},function (json) {
            if (json.error==0){
                $this.setData({
                    code: true,
                    qrcode: json.url
                })
            }else{
                core.alert(json.message);
            }
        },true);
    },
    close: function () {
        this.setData({
            code: false
        })
    },
    cancel:function (e) {
        var orderid = core.data(e).orderid;
        order.cancel(orderid,e.detail.value,'/pages/order/index?status='+this.data.status);
    },
  delete: function (e) {
    var type = core.data(e).type, orderid = core.data(e).orderid;
    console.log(type,orderid);
    order.delete(orderid, type, '/pages/order/index', this);
  },
    finish:function (e) {
        var type = core.data(e).type,orderid = core.data(e).orderid;;
        order.finish(orderid,'/pages/order/index');
    },
    onShareAppMessage: function () {
        return core.onShareAppMessage();
    },
  payOrder:function(e){
    console.log(this.data.list);
    var list=this.data.list;
    var type = core.pdata(e).type;
    console.log(e, type);
    var id=e.target.dataset.id;
    var did=e.target.dataset.did;
    var $this=this;

    var payinfo=list[did].payinfo.payinfo;
    core.post('order/pay/checkstock', { id: id }, function (check_json) {
      if (check_json.error != 0) {
        foxui.toast($this, check_json.message);
        return;
      }
      console.log(payinfo)
      core.pay(payinfo, function (res) {
        if (res.errMsg == "requestPayment:ok") {
          // 跳转订单详情
          // wx.navigateTo({
          //   url: '/pages/order/detail/index?id='+id,
          // })
          core.get('order/paysend',{id:id},function(res){
            console.log(res)
          })
          //刷新页面
          $this.get_updata_list(); 
        }
      });
    }, true, true)
  },
  checkexpress: function (e) {
    let expressid = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/order/express/index?id='+expressid,
    })
  }
});