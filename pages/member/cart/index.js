/**
 *
 * member/cart/index.js
 *
 * @create 2017-1-5
 * @author Young
 *
 * @update  Young 2017-01-10
 *
 */

var app = getApp();
var core = app.requirejs('core');
var foxui = app.requirejs('foxui');
var $ = app.requirejs('jquery');
const Crypto = require('../../../utils/aes.js')
Page({
  data: {
    route: 'cart',
    icons: app.requirejs('icons'),
    merch_list: false,
    list: false,
    edit_list: [],

    modelShow: false
  },
  onLoad: function (options) {
    app.checkAuth();
    var $this = this;
    core.get('black', {}, function (res) {
      if (res.isblack) {
        wx.showModal({
          title: '无法访问',
          content: '您在商城的黑名单中，无权访问！',
          success: function (res) {
            if (res.confirm) {
              $this.close()
            }
            if (res.cancel) {
              $this.close()
            }
          }
        })
      }
    });
    app.url(options);
  },
  onShow: function () {
    this.get_cart();
    var $this = this;
    $this.setData({
      imgUrl: app.globalData.approot
    });
    wx.getSetting({
      success: function (res) {
        var limits = res.authSetting['scope.userInfo'];
        $this.setData({ limits: limits })
        if (!limits) {
          // $this.setData({modelShow: true})
        }
      }
    })
  },
  get_cart: function () {
    var $this = this, setData;
    let useropenid = 'sns_wa_' + app.getCache('userinfo_openid')
    let data = {
      'openid': useropenid
    }
    let jsonData = JSON.stringify(data)

    data = Crypto.CryptoJS.encrypt(jsonData, Crypto.keyCrypto.key, Crypto.keyCrypto.iv)


    core.get('member/cart/get_cart', { crydata: data}, function (data) {
      console.log(data,'购物车');
      setData = {
        show: true,
        ismerch: false,
        ischeckall: data.ischeckall,
        total: data.total,
        cartcount: data.total,
        totalprice: data.totalprice,
        empty: data.empty || false
      };
      if (typeof data.merch_list == 'undefined') {
        setData.list = data.list || [];
        $this.setData(setData)
      } else {
        setData.merch_list = data.merch_list || [];
        setData.ismerch = true;
        $this.setData(setData)
      }
    });
  },
  edit: function (e) {
    let index = e.currentTarget.dataset.index;
    var $this = this;
    if (!$this.data.limits) {
      // $this.setData({ modelShow: true })
      return;
    }
    var dataset = core.data(e), $this = this, ids;
    switch (dataset.action) {
      case 'edit':
        this.setData({ edit: true }); break;
      case 'complete':
        this.allgoods(false);
        this.setData({ edit: false }); break;
      case 'move':
        ids = this.checked_allgoods().data;
        if (!$.isEmptyObject(ids)) {
          core.post('member/cart/tofavorite', { ids: ids }, function (data) {
            $this.get_cart();
          });
        } break;
      case 'delete':
        ids = e.target.dataset.id;
        console.log(ids);
        if (!$.isEmptyObject(ids)) {
          console.log()
          core.confirm('是否确认删除该商品?', function () {
            core.post('member/cart/remove', { ids: [ids] }, function (data) {
              $this.get_cart();
            });

            // app.sensors.track('CartManipulated', {
            //   product_id: ids,
            //   goods_name: $this.data.list[index].title,
            //   submit_type: "addGoods",

            // });

          });
        } break;
      case 'pay':
        if (this.data.total > 0) {
          wx.navigateTo({
            url: '/pages/order/create/index'
          });
        }
        break;
    }
  },
  checkall: function (e) {
    core.loading();
    var $this = this, select = this.data.ischeckall ? 0 : 1;
    core.post('member/cart/select', { id: 'all', select: select }, function (data) {
      $this.get_cart();
      core.hideLoading();
    });
  },
  update: function (e) {
    var $this = this, select = this.data.ischeckall ? 0 : 1;
    core.post('member/cart/select', { id: 'all', select: select }, function (data) {
      $this.get_cart();
    });
  },
  number: function (e) {
    let index = e.currentTarget.dataset.index;
    var $this = this, dataset = core.pdata(e), val = foxui.number(this, e), id = dataset.id, optionid = dataset.optionid;
    console.log(index, 'index', $this.data.list)
    if ((val == 1 && dataset.value == 1 && e.target.dataset.action == 'minus') || (dataset.value == dataset.max && e.target.dataset.action == 'plus')) {
      return;
    }
    core.post('member/cart/update', { id: id, optionid: optionid, total: val }, function (data) {
      $this.get_cart();
    });
    // app.sensors.track('CartManipulated', {
    //   product_id: id,
    //   goods_name: $this.data.list[index].title,
    //   submit_type: "addGoods",

    // });
  },
  selected: function (e) {
    core.loading();
    console.log(e.target);
    var $this = this, dataset = core.pdata(e), id = dataset.id, select = dataset.select == 1 ? 0 : 1;
    core.post('member/cart/select', { id: id, select: select }, function (data) {
      $this.get_cart();
      core.hideLoading();
    });

  },
  allgoods: function (check) {
    var edit_list = this.data.edit_list;
    if (!$.isEmptyObject(edit_list) && typeof check == 'undefined') {
      return edit_list;
    }
    check = typeof check == 'undefined' ? false : check;
    if (this.data.ismerch) {
      for (var i in this.data.merch_list) {
        for (var ii in this.data.merch_list[i].list) {
          edit_list[this.data.merch_list[i].list[ii].id] = check
        }
      }
    } else {
      for (var i in this.data.list) {
        edit_list[this.data.list[i].id] = check
      }
    }
    return edit_list;
  },
  checked_allgoods: function () {
    var allgoods = this.allgoods(), data = [], cartcount = 0;
    for (var ii in allgoods) {
      if (allgoods[ii]) {
        data.push(ii);
        cartcount++
      }
    }
    return { data: data, cartcount: cartcount };
  },
  editcheckall: function (e) {
    var check = core.pdata(e).check, edit_list = this.allgoods(!check);
    this.setData({
      edit_list: edit_list,
      editcheckall: !check
    });
    this.editischecked();
  },
  editischecked: function () {
    var editischecked = false, editcheckall = true, allgoods = this.allgoods();
    for (var i in this.data.edit_list) {
      if (this.data.edit_list[i]) {
        editischecked = true; break;
      }
    }
    for (var ii in allgoods) {
      if (!allgoods[ii]) {
        editcheckall = false; break;
      }
    }
    this.setData({
      editischecked: editischecked,
      editcheckall: editcheckall
    })
  },
  edit_list: function (e) {
    var dataset = core.pdata(e), edit_list = this.data.edit_list;
    if (typeof edit_list[dataset.id] != 'undefined' && edit_list[dataset.id] == 1) {
      edit_list[dataset.id] = false;
    } else {
      edit_list[dataset.id] = true;
    }
    this.setData({
      edit_list: edit_list
    });
    this.editischecked();
  },
  url: function (e) {
    var data = core.pdata(e);
    wx.navigateTo({
      url: data.url
    });
  },
  onShareAppMessage: function () {
    return core.onShareAppMessage();
  },


  /*用户授权-取消*/
  cancelclick: function () {
    this.setData({ modelShow: false })
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  /*用户授权-去设置*/
  confirmclick: function () {
    this.setData({ modelShow: false });
    wx.openSetting({
      success: function (res) { }
    })
  },
  close: function () {
    app.globalDataClose.flag = true;
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  // userinfo:function(e){
  //   var $this = this;
  //   app.getUserInfo(function(){
  //     $this.onShow();
  //   });
  // }

  toCustom(e) {
    let url = e.currentTarget.dataset.url
    let id = e.currentTarget.dataset.id
    let goodsid=e.currentTarget.dataset.goodsid;
    let step1 = e.currentTarget.dataset.step1 ? e.currentTarget.dataset.step1:{};
    let step2 = e.currentTarget.dataset.step2 ? e.currentTarget.dataset.step2:{};
    wx.navigateTo({
      url: url + '?cartid=' + id + '&goodsId=' + goodsid + "&firstStep=" + JSON.stringify(step1) + "&sendStep=" + JSON.stringify(step2),
    })
  },

  toCustom1(e) {
    let url = e.currentTarget.dataset.url;
    let id = e.currentTarget.dataset.id;
    let goodsId=e.currentTarget.dataset.goodsid;
    let fengtaoid=e.currentTarget.dataset.fengtaoid;
    let boxCode = e.currentTarget.dataset.boxcode ? e.currentTarget.dataset.boxcode : "";
    let step1 = e.currentTarget.dataset.step1;
    let step2 = e.currentTarget.dataset.step2;
    wx.navigateTo({
      url: url + '?cartId=' + id + '&id=' + goodsId + '&fengtaoid=' + fengtaoid + "&firstStep=" + JSON.stringify(step1) + "&sendStep=" + JSON.stringify(step2),
    })
  },

});