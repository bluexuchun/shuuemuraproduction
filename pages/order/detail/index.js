/**
 *
 * order/detail/index.js
 *
 * @create 2017-1-12
 * @author Young
 *
 * @update  Young 2017-01-16
 *
 */
var app = getApp(),core=app.requirejs('core'),order = app.requirejs('biz/order');
var foxui = app.requirejs('foxui');
Page({
    data: {
        code: false,
        consume: false,
        store: false,
        cancel:order.cancelArray,
        cancelindex:0,
        diyshow:{},
        city_express_state: 0,
      sercharge:0,
      getOrder:"",
      lists:""
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            options: options
        });
        app.url(options);
    },
    onShow:function () {
        var $this = this;
        $this.get_list();
        var isIpx = app.getCache('isIpx');
        if (isIpx) {
          $this.setData({
            isIpx: true,
            iphonexnavbar: 'fui-iphonex-navbar',
            paddingb: 'padding-b'
          })
        } else {
          $this.setData({
            isIpx: false,
            iphonexnavbar: '',
            paddingb: ''
          })
        }
    },
    get_list: function () {
        var $this = this;
        core.get('auth/get_token', {
          sessionid: wx.getStorageSync("sessionid")
        }, function (data) {
          wx.setStorageSync("tokenId", data.token)
          let useropenid = wx.getStorageSync('tokenId') + app.getCache('userinfo_openid')
          core.get('order/detail', 
            { ...$this.data.options, sessionid: wx.getStorageSync("sessionid"), token: useropenid}
          , function (list) {
            // if(list.error == '-7'){
            //     core.toast(list.message, 'none');
            // }
            if (list.error>0){
              if (list.error != 50000) {
                core.toast(list.message, 'loading');
              }
            }
              if(list.nogift[0].fullbackgoods != undefined ){
                var fullbackratio = list.nogift[0].fullbackgoods.fullbackratio;
              var maxallfullbackallratio = list.nogift[0].fullbackgoods.maxallfullbackallratio;
              var fullbackratio = Math.round(fullbackratio);
              var maxallfullbackallratio = Math.round(maxallfullbackallratio);
              }
        
              if (list.error==0){
                  $this.setData({
                    getOrder: JSON.stringify(list),
                    lists: list
                  })
                  list.show = true;
                  var ordervirtualtype = Array.isArray(list.ordervirtual);
                  list.goods.map((v,i) => {
                    v.price = parseInt(v.price)
                  })
                  list.order.price = parseInt(list.order.price)
                  list.order.goodsprice = parseInt(list.order.goodsprice)
                  $this.setData(list);
                  $this.setData({
                    ordervirtualtype: ordervirtualtype, fullbackgoods: list.nogift[0].fullbackgoods, maxallfullbackallratio: maxallfullbackallratio, fullbackratio: fullbackratio, invoice: list.order.invoicename, membercard_info: list.membercard_info ,
                    
                    })
                  if(list.sercharge){
                    $this.setData({
                      sercharge:list.sercharge
                    })
                  }
              }
          })
        });
    },
    more:function(){
      this.setData({all:true})
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
    diyshow: function (e) {
        var diyshow=this.data.diyshow,goodsid=core.data(e).id;
        diyshow[goodsid] = !diyshow[goodsid];
        this.setData({
            diyshow:diyshow
        });
    },
    close: function () {
        this.setData({
            code: false,
        })
    },
    toggle: function (e) {
        var data = core.pdata(e),id=data.id,type=data.type,d={};
        (id == 0 || typeof id =='undefined') ? d[type] = 1 : d[type] = 0;
        this.setData(d);
    },
    phone:function(e){
        core.phone(e);
    },
    cancel:function (e) {
        order.cancel(this.data.options.id,e.detail.value,'/pages/order/detail/index?id='+this.data.options.id);
      // var goodsList = new Array();
      // this.data.list.forEach((item) => {
      //   goodsList.push(item.goodsSn);
      // })
      // app.sensors.track('OrderCancel', {
      //   order_id: this.data.nogift[0].id,
      //   product_id_list: "",
      //   order_name: this.data.nogift[0].title,
      //   order_phone: this.data.address.mobile,
      //   order_province: this.data.address.province,
      //   order_city: this.data.address.city,
      //   order_district: this.data.address.area,
      //   order_address: this.data.address.address,
      //   order_price: this.data.order.price,
      //   transp_cost: this.data.order.dispatchprice,
      //   service_cost: this.data.sercharge,
      // });


    },
    delete:function (e) {
        var type = core.data(e).type;
        order.delete(this.data.options.id,type,'/pages/order/index');
    },
    finish:function (e) {
        order.finish(this.data.options.id,'/pages/order/index');
    },
    refundcancel:function (e) {
        var $this = this;
        order.refundcancel(this.data.options.id,function () {
            $this.get_list();
        });
    },
    onShareAppMessage: function () {
        return core.onShareAppMessage();
    },
    pay: function (e) {
      var $this = this;
      let id =  e.currentTarget.dataset.id;
      core.post('order/pay/checkstock', { id: id }, function (check_json) {
        if (check_json.error != 0) {
          foxui.toast($this, check_json.message);
          return;
        }
        console.log($this.data.lists.payinfo.payinfo)
        core.pay($this.data.lists.payinfo.payinfo, function (res) {
          if (res.errMsg == "requestPayment:ok") {
            $this.get_list()
          }
        });

      }, true, true)
    },

    checkexpress: function (e) {
      let expressid = e.currentTarget.dataset.id
      wx.navigateTo({
        url: '/pages/order/express/index?id=' + expressid,
      })
    }
})