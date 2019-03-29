/**
 *
 * order/create/index.js
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
var diyform = app.requirejs('biz/diyform');
var $ = app.requirejs('jquery');
var selectdate = app.requirejs('biz/selectdate');
var parser = app.requirejs('wxParse/wxParse');
const Crypto = require('../../../utils/aes.js')
Page({
  data: {
    icons: app.requirejs('icons'),
    list: {},
    goodslist: {},
    data: {
      dispatchtype: 0,
      remark: ''
    },
    areaDetail: {
      detail: {
        realname: '',
        mobile: '',
        areas: '',
        street: '',
        address: ''
      },
    },
    merchid: 0,
    showPicker: false,
    pvalOld: [0, 0, 0],
    pval: [0, 0, 0],
    areas: [],
    street: [],
    streetIndex: 0,
    noArea: false,
    showaddressview: false,
    city_express_state: false,
    // 以下 周期购
    currentDate: "",
    dayList: '',
    currentDayList: '',
    currentObj: '',
    currentDay: '',
    cycelbuy_showdate: '',
    receipttime: '',
    scope: '',
    bargainid: '',
    courtesys:"",//
    //会员卡
    selectcard: '',

    // 是否刻字服务费
    isextra: true
  },
  onLoad: function(options) {
    console.log(options)
    // 页面初始化 options为页面跳转所带来的参数
    var $this = this,
      goodslist = [];
    if (options.goods) {
      var goods = JSON.parse(options.goods);
      options.goods = goods;
      this.setData({
        ispackage: true
      })
    }
    $this.setData({
      options: options
    });
    $this.setData({
      bargainid: options.bargainid
    });
    app.url(options);
    let useropenid = 'sns_wa_' + app.getCache('userinfo_openid')
    let data = {
      ...$this.data.options,
      'openid': useropenid
    }
    let jsonData = JSON.stringify(data)
    console.log(jsonData)
    data = Crypto.CryptoJS.encrypt(jsonData, Crypto.keyCrypto.key, Crypto.keyCrypto.iv)


    core.get('order/create', { crydata: data}, function(list) {
      console.log(list);
      /**
       * 判断刻字服务费
       */
      let basic = list.basic
      let isextra = false
      let letterprice = 0
      if (basic != null) {
        if (basic.status == "2") {
          if (list.goodsprice > basic.full) {
            isextra = false
            letterprice = 0
          } else {
            isextra = true
            letterprice = basic.sercharge
          }
        } else {
          isextra = true
          letterprice = basic.sercharge
        }
        $this.setData({
          isextra: isextra,
          letterprice: letterprice
        })
      } else {
        $this.setData({
          isextra: false
        })
      }


      if (list.error == 0) {
        console.log('list',list)

        // 植村秀赠品专属
        core.get('order/create/gifts',{
          goodsprice:list.realprice
        },function(gift){
          console.log(gift)
          $this.setData({
            zcxgifttips:gift.full,
            zcxgiftlists:gift.gift_list,
          })
        })





        // 循环尊享体验礼
        // 循环尊享体验礼
        list.super.map((v, k) => {
          // 动态渲染富文本
          parser.wxParse('content', 'html', v.content, $this, 8);
          list.super[k].content = $this.data.content

          console.log(v)

          // 计算当前的类型
          let type = v.type


          // 获取指定商品是否在这活动中
          let activity = v.activity

          /**
           * type 1 - 满件增
           * type 2 - 满额赠
           * type 3 - 满件赠或满额赠
           * type 4 - 满件赠且满额赠
           */
          if (type == '1') {
            let condition = JSON.parse(v.condition)
            let unit = 0

            // 计算总数量
            activity.map((a, c) => {
              if (a.status == "ture") {
                unit += Number(a.total)
              }
            })

            // 计算可以勾选的数量
            let chosenum = 0;

            // 计算剩余多少可以进入下一阶段
            let restnum = 0;

            // 下一阶段 送多少
            let nextnum = 0;
            for (var i = 0; i < condition.length - 1; i++) {
              if (unit >= 0 && unit < Number(condition[0].fill_unit)) {

                restnum += Number(condition[0].fill_unit) - unit
                nextnum = Number(condition[0].send_unit)
                break;
              }
              if (unit >= Number(condition[i].fill_unit) && unit < Number(condition[i + 1].fill_unit)) {
                restnum += Number(condition[i + 1].fill_unit) - unit
                chosenum = Number(condition[i].send_unit)
                nextnum = Number(condition[i + 1].send_unit)
                break;
              }
              if (unit >= Number(condition[condition.length - 1].fill_unit)) {
                restnum = 'free'
                chosenum = Number(condition[condition.length - 1].send_unit)
                break;
              }
            }
            list.super[k].restnum = restnum
            list.super[k].chosenum = chosenum
            list.super[k].nextnum = nextnum
          } else if (type == '2') {
            let condition = JSON.parse(v.condition)
            let unit = 0
            // 计算总数量
            activity.map((a, c) => {
              if (a.status == "ture") {
                unit += Number(a.marketprice) * Number(a.total)
              }

            })

            // 计算可以勾选的数量
            let chosenum = 0;

            // 计算剩余多少可以进入下一阶段
            let restnum = 0;

            // 下一阶段 送多少
            let nextnum = 0;
            console.log(unit)
            for (var i = 0; i < condition.length - 1; i++) {
              if (unit >= 0 && unit < Number(condition[0].fill_money)) {
                restnum += Number(condition[0].fill_money) - unit
                nextnum = Number(condition[0].send_unit)
                break;
              }
              if (unit >= Number(condition[i].fill_money) && unit < Number(condition[i + 1].fill_money)) {
                restnum += Number(condition[i + 1].fill_money) - unit
                chosenum = Number(condition[i].send_unit)
                nextnum = Number(condition[i + 1].send_unit)
                break;
              }
              if (unit >= Number(condition[condition.length - 1].fill_money)) {
                restnum = 'free'
                chosenum = Number(condition[condition.length - 1].send_unit)
                break;
              }
            }
            list.super[k].restnum = restnum
            list.super[k].chosenum = chosenum
            list.super[k].nextnum = nextnum
          } else if (type == "3") {
            let condition = JSON.parse(v.condition)
            console.log(condition)
            // 价格
            let allmoney = 0
            // 件数
            let unit = 0
            // 计算总数量
            activity.map((a, c) => {
              if (a.status == "ture") {
                allmoney += Number(a.marketprice) * Number(a.total)
                unit += Number(a.total)
              }
            })


            // 计算可以勾选的数量
            let chosenum = 0;

            // 计算剩余多少件可以进入下一阶段
            let restnum = 0;
            // 计算剩余多少钱可以进入下一阶段
            let restmoney = 0;
            // 下一阶段 送多少
            let nextnum = 0;

            for (var i = 0; i < condition.length - 1; i++) {
              if (unit >= 0 && unit < Number(condition[0].fill_unit) && allmoney >= 0 && allmoney < Number(condition[0].fill_money)) {
                restmoney += Number(condition[0].fill_money) - allmoney
                restnum += Number(condition[0].fill_unit) - unit
                nextnum = Number(condition[0].send_unit)
                break;
              }
              if (unit >= Number(condition[i].fill_money) && unit < Number(condition[i + 1].fill_money)) {
                restnum += Number(condition[i + 1].fill_money) - unit
                chosenum = Number(condition[i].send_unit)
                nextnum = Number(condition[i + 1].send_unit)
                break;
              }
              if (unit >= Number(condition[condition.length - 1].fill_money)) {
                restnum = 'free'
                chosenum = Number(condition[condition.length - 1].send_unit)
                break;
              }
            }
            list.super[k].restnum = restnum
            list.super[k].chosenum = chosenum
            list.super[k].nextnum = nextnum
          }
        })

        let addressDetail = wx.getStorageSync("address")
        if(addressDetail){
          $this.setData({
            addressDetail
          })
        }
        goodslist = $this.getGoodsList(list.goods);
        var comboprice = ($this.data.originalprice - list.goodsprice).toFixed(2);
        let spegifts = []
        Object.keys(list.boxgiftdata).forEach(function (key) {
          spegifts.push({
            ...list.boxgiftdata[key]
          })
        });
        $this.setData({
          list: list,
          goods: list,
          show: true,
          address: true,
          card_info: list.card_info || {},
          cardid: list.card_info.cardid || '',
          cardname: list.card_info.cardname || '',
          carddiscountprice: list.card_info.carddiscountprice,
          goodslist: goodslist,
          merchid: list.merchid,
          comboprice: comboprice,
          diyform: {
            f_data: list.f_data,
            fields: list.fields
          },
          city_express_state: list.city_express_state,
          cycelbuy_showdate: list.selectDate,
          receipttime: list.receipttime,
          iscycel: list.iscycel,
          scope: list.scope,
          fromquick: list.fromquick,
          hasinvoice: list.hasinvoice,
          giftsuperlist: list.super,
          /**
           * 专享赠礼
           */
          spegifts: spegifts,
          courtesys: list.courtesys,
          // 独家礼遇
          /**
           * 假设为已支付
           * 那么享受所有订单
           * condition 1 为第一单获取
           * condition 2 为所有单获取
           */
          giftlist: list.activtype
        });

        app.setCache("goodsInfo", {
          goodslist: goodslist,
          merchs: list.merchs
        }, 1800);

      } else {
        core.toast(list.message, 'loading');
        setTimeout(function() {
          wx.navigateBack();
        }, 1000);
      }

      if (list.fullbackgoods != '') {
        if (list.fullbackgoods == undefined) {
          return
        }
        var fullbackratio = list.fullbackgoods.fullbackratio;
        var maxallfullbackallratio = list.fullbackgoods.maxallfullbackallratio;
        var fullbackratio = Math.round(fullbackratio);
        var maxallfullbackallratio = Math.round(maxallfullbackallratio);
        $this.setData({
          fullbackratio: fullbackratio,
          maxallfullbackallratio: maxallfullbackallratio
        })
      }
      if (list.iscycel == 1) {
        $this.show_cycelbuydate();
      }

    });

    this.getQuickAddressDetail();
    app.setCache("coupon", '');
    setTimeout(function() {
      $this.setData({
        areas: app.getCache("cacheset").areas
      })
    }, 3000)

  },


  show_cycelbuydate: function() {
    var $this = this;
    /*周期购时间选择器初始化*/
    var currentObj = selectdate.getCurrentDayString(this, $this.data.cycelbuy_showdate);
    var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    $this.setData({
      currentObj: currentObj,
      currentDate: currentObj.getFullYear() + '.' + (currentObj.getMonth() + 1) + '.' + currentObj.getDate() + ' ' + week[currentObj.getDay()],
      currentYear: currentObj.getFullYear(),
      currentMonth: (currentObj.getMonth() + 1),
      currentDay: currentObj.getDate(),
      initDate: Date.parse(currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/' + currentObj.getDate()),
      checkedDate: Date.parse(currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/' + currentObj.getDate()),
      maxday: $this.data.scope, //可选的天数
    })
  },

  onShow: function() {
    var $this = this,
      address = app.getCache("orderAddress"),
      shop = app.getCache("orderShop");
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


    if (address) {
      this.setData({
        'list.address': address
      });
      // $this.caculate($this.data.list);
    }
    if (shop) {

      this.setData({
        'list.carrierInfo': shop,
        'list.storeInfo': shop
      });
    }

    var coupon = app.getCache("coupon");

    if (typeof coupon == 'object' && coupon.id != 0) {
      this.setData({
        'data.couponid': coupon.id,
        'data.couponname': coupon.name
      });
      core.post('order/create/getcouponprice', {
        couponid: coupon.id,
        goods: this.data.goodslist,
        goodsprice: this.data.list.goodsprice,
        discountprice: this.data.list.discountprice,
        isdiscountprice: this.data.list.isdiscountprice
      }, function(data) {
        if (data.error == 0) {
          delete data.$goodsarr;
          $this.setData({
            coupon: data
          });
          $this.caculate($this.data.list);
        } else {
          core.alert(data.message);
        }
      }, true);
    } else {
      this.setData({
        'data.couponid': 0,
        'data.couponname': null,
        coupon: null
      });
      if (!$.isEmptyObject($this.data.list)) {
        // $this.caculate($this.data.list);
      }
    }
  },

  // 获取商品列表
  getGoodsList: function(list) {
    var goodslist = [];
    $.each(list, function(k, v) {
      $.each(v.goods, function(kk, vv) {
        goodslist.push(vv);
      });
    });
    // console.log(goodslist);
    var originalprice = 0;
    for (var i = 0; i < goodslist.length; i++) {
      originalprice += goodslist[i].price;
    }
    console.log(originalprice);
    this.setData({
      originalprice: originalprice
    })
    return goodslist;
  },


  toggle: function(e) {
    var data = core.pdata(e),
      id = data.id,
      type = data.type,
      d = {};
    (id == 0 || typeof id == 'undefined') ? d[type] = 1: d[type] = 0;
    this.setData(d);
  },
  phone: function(e) {
    core.phone(e);
  },
  dispatchtype: function(e) {
    var type = core.data(e).type;
    this.setData({
      'data.dispatchtype': type
    });
    this.caculate(this.data.list);
  },
  number: function(e) {
    var $this = this,
      dataset = core.pdata(e),
      val = foxui.number(this, e),
      id = dataset.id,
      list = $this.data.list,
      total = 0,
      goodsprice = 0.0;
    $.each(list.goods, function(k, v) {
      $.each(v.goods, function(kk, vv) {
        if (vv.id == id) {
          list.goods[k].goods[kk].total = val;
        }
        total += parseInt(list.goods[k].goods[kk].total);
        goodsprice += parseFloat(total * list.goods[k].goods[kk].price);
      });
    });
    list.total = total;
    list.goodsprice = $.toFixed(goodsprice, 2);
    $this.setData({
      list: list,
      goodslist: $this.getGoodsList(list.goods)
    });
    // this.caculate(list);
  },
  // caculate: function(list) {
  //   var $this = this;
  //   var couponid = 0;
  //   if ($this.data.data && $this.data.data.couponid != 0) {
  //     couponid = $this.data.data.couponid
  //   }

  //   core.post('order/create/caculate', {
  //     goods: this.data.goodslist,
  //     dflag: this.data.data.dispatchtype,
  //     addressid: this.data.list.address ? this.data.list.address.id : 0,
  //     packageid: this.data.list.packageid,
  //     bargain_id: this.data.bargainid,
  //     discountprice: this.data.list.discountprice,
  //     cardid: this.data.cardid,
  //     couponid: couponid,
  //   }, function(data) {
  //     console.error(data)
  //     list.dispatch_price = data.price;
  //     list.enoughdeduct = data.deductenough_money;
  //     list.enoughmoney = data.deductenough_enough;
  //     list.taskdiscountprice = data.taskdiscountprice;
  //     list.discountprice = data.discountprice;
  //     list.isdiscountprice = data.isdiscountprice;
  //     list.seckill_price = data.seckill_price;
  //     list.deductcredit2 = data.deductcredit2;
  //     list.deductmoney = data.deductmoney;
  //     list.deductcredit = data.deductcredit;
  //     if ($this.data.data.deduct) {
  //       data.realprice -= data.deductmoney //减去积分抵扣的金额
  //     }
  //     if ($this.data.data.deduct2) {
  //       data.realprice -= data.deductcredit2
  //     }
  //     if ($this.data.coupon && typeof($this.data.coupon.deductprice) != 'undefined') {
  //       $this.setData({
  //         "coupon.deductprice": data.coupon_deductprice
  //       });
  //       data.realprice -= data.coupon_deductprice;
  //     }
  //     if (data.card_info) {
  //       list.card_free_dispatch = data.card_free_dispatch;
  //     }
  //     if ($this.data.goods.giftid == 0) {
  //       $this.setData({
  //         "goods.gifts": data.gifts
  //       });
  //     }
  //     if (list.realprice <= 0) {
  //       list.realprice = 0.000001;
  //     }
  //     list.realprice = $.toFixed(data.realprice, 2);
  //     $this.setData({
  //       list: list,
  //       cardid: data.card_info.cardid,
  //       cardname: data.card_info.cardname,
  //       goodsprice: data.card_info.goodsprice,
  //       carddiscountprice: data.card_info.carddiscountprice,
  //       city_express_state: data.city_express_state
  //     });
  //   }, true);
  // },
  submit: function(e) {
    var that = this;
    let formid = e.detail.formId
    let giftlist = this.data.giftlist.giftgoodsid,
      giftsuperlist = this.data.zcxgiftlists;

    let giftlistid = [],
      giftsuperlistid = [];
    if (giftlist && giftlist!=  null){
      giftlist.map((v, i) => {
        giftlistid.push(v.id)
      })
    }
    
    if (that.data.zcxgifttips){
      if (that.data.zcxgifttips.ismin != 1) {
        giftsuperlist.map((v, i) => {
          giftsuperlistid.push(v.id)
        })
      }
    }

    if (that.data.spegifts){
      that.data.spegifts.map((v,i) =>{
        console.log(v)
        if(v){
          if (v.num >= 1){
            for(let i = 0;i < v.num;i++){
              giftsuperlistid.push(v.id)
            }
          }
        }
      })
    }
    // core.pay(wechat.payinfo, function (res) {
    //   if (res.errMsg == "requestPayment:ok") {
    //     $this.complete(type)
    //     // $this.setData({coupon: true})
    //   }
    // });
    // return false;

    var data = this.data,
      $this = this,
      diydata = this.data.diyform;
    var giftid = data.giftid;
    if (this.data.goods.giftid == 0 && this.data.goods.gifts.length == 1) {
      giftid = this.data.goods.gifts[0].id;
      // console.log(giftid)
    }
    
    if (data.submit) {
      return;
    }

    var verify = diyform.verify(this, diydata);
    if (!verify) {
      return;
    }

    data.list.carrierInfo = data.list.carrierInfo || {};

    var subdata = {
      'id': data.options.id ? data.options.id : 0,
      'goods': data.goodslist,
      'gdid': data.options.gdid,
      'dispatchtype': data.data.dispatchtype,
      'fromcart': data.list.fromcart,
      'carrierid': (data.data.dispatchtype == 1 && data.list.carrierInfo) ? data.list.carrierInfo.id : 0,
      'addressid': data.list.address ? data.list.address.id : 0,
      'carriers': (data.data.dispatchtype == 1 || data.list.isvirtual || data.list.isverify) ? {
        'carrier_realname': data.list.member.realname,
        'carrier_mobile': data.list.member.mobile,
        'realname': data.list.carrierInfo.realname,
        'mobile': data.list.carrierInfo.mobile,
        'storename': data.list.carrierInfo.storename,
        'address': data.list.carrierInfo.address
      } : '',
      'remark': data.data.remark,
      'deduct': data.data.deduct,
      'deduct2': data.data.deduct2,
      'couponid': data.data.couponid,
      'cardid': data.cardid,
      'invoicename': data.list.invoicename,
      'submit': true,
      'packageid': data.list.packageid,
      'giftid': giftid,
      'diydata': data.diyform.f_data,
      'receipttime': data.receipttime,
      'bargain_id': $this.data.options.bargainid,
      'fromquick': data.fromquick,
      'addressDetail': $this.data.addressDetail,
      'giftlistid': giftlistid,
      'giftsuperlistid': giftsuperlistid,
      'huoquguige': that.data.list.goods,
      'formid': formid,
      'fail': function() {
        console.log('1111');
      }
    };

    // if (data.list.storeInfo) {
    //   subdata.carrierid = data.list.storeInfo.id;
    // }
    // if (data.data.dispatchtype == 1 || data.list.isvirtual || data.list.isverify) {
    //   if ($.trim(data.list.member.realname) == '' && data.list.set_realname == '0') {
    //     core.alert('请填写联系人!');
    //     return;
    //   }
    //   if ($.trim(data.list.member.mobile) == '' && data.list.set_mobile == '0') {
    //     core.alert('请填写联系方式!');
    //     return;
    //   }
    //   if (data.list.isforceverifystore) {
    //     if (!data.list.storeInfo) {
    //       core.alert('请选择门店!');
    //       return;
    //     }
    //   }
    //   subdata.addressid = 0;
    // } else {
    //   if (!subdata.addressid && !data.list.isonlyverifygoods) {
    //     core.alert('地址没有选择!');
    //     return;
    //   }
    // }
    if (this.data.addressDetail == null) {
      core.alert('地址没有选择!');
      return;
    }
    $this.setData({
      submit: true
    });
    let useropenid = 'sns_wa_' + app.getCache('userinfo_openid')
    let newdata = {
      ...subdata,
      'openid': useropenid
    }
    let jsonData = JSON.stringify(newdata)
    newdata = Crypto.CryptoJS.encrypt(jsonData, Crypto.keyCrypto.key, Crypto.keyCrypto.iv)

    core.post('order/create/submit', { crydata: newdata}, function(ret) {

      let addressInfo = wx.getStorageSync("address")
      let newGoods = that.data.goods;
      console.log($this.data.goodslist,newGoods,'newGoodsnewGoodsnewGoodsnewGoods')
      $this.setData({
        submit: false
      });
      if (ret.error != 0) {
        if(ret.error == 10010){
          core.alert(ret.message, function(){
            console.log('123')
            wx.navigateTo({
              url: '/member/pages/member/bind/index',
            })
          });
          
          return;
        }else{
          core.alert(ret.message);
          return;
        }
      } else {
        if (ret.wechat.success) {
          wx.showToast({
            title: '下单成功',
            icon: 'success',
            duration: 1000
          })
          let addressInfo = wx.getStorageSync("address")
          setTimeout(() => {
            core.pay(ret.wechat.payinfo, function(res) {
              console.log('$this.data.goodslist$this.data.goodslist', $this.data.goodslist)

              if (res.errMsg == "requestPayment:ok") {
                $this.data.goodslist.forEach((item, index) => {
                  console.log(index, item)
                });
                wx.navigateTo({
                  url: '/pages/order/detail/index?id=' + ret.orderid
                });
              }
            }, function() {
              wx.navigateTo({
                url: '/pages/order/detail/index?id=' + ret.orderid
              });
            });
          },1000)
        }

      }

    })
  },
  dataChange: function(e) {
    var data = this.data.data,
      list = this.data.list,
      id = e.target.id;
    switch (id) {
      case 'remark':
        data.remark = e.detail.value;
        break;
      case 'deduct':
        data.deduct = e.detail.value;
        if (data.deduct2) {
          return;
        }
        var realprice = parseFloat(list.realprice);
        realprice += data.deduct ? -parseFloat(list.deductmoney) : parseFloat(list.deductmoney);
        list.realprice = realprice;
        break;
      case 'deduct2':
        data.deduct2 = e.detail.value;
        if (data.deduct) {
          return;
        }
        var realprice = parseFloat(list.realprice);
        realprice += data.deduct2 ? -parseFloat(list.deductcredit2) : parseFloat(list.deductcredit2);
        list.realprice = realprice;
        break;
    }

    if (list.realprice <= 0) {
      list.realprice = 0.000001;
    }
    list.realprice = $.toFixed(list.realprice, 2);

    this.setData({
      data: data,
      list: list
    })
  },
  listChange: function(e) {
    var list = this.data.list,
      id = e.target.id;
    switch (id) {
      case 'invoicename':
        list.invoicename = e.detail.value;
        break;
      case 'realname':
        list.member.realname = e.detail.value;
        break;
      case 'mobile':
        list.member.mobile = e.detail.value;
        break;
    }
    this.setData({
      list: list
    })
  },
  url: function(e) {
    var url = core.pdata(e).url;
    wx.redirectTo({
      url: url
    });
  },
  onChange: function(e) {
    return diyform.onChange(this, e)
  },
  DiyFormHandler: function(e) {
    return diyform.DiyFormHandler(this, e)
  },
  selectArea: function(e) {
    return diyform.selectArea(this, e)
  },
  bindChange: function(e) {
    return diyform.bindChange(this, e)
  },
  onCancel: function(e) {
    return diyform.onCancel(this, e)
  },
  onConfirm: function(e) {
    diyform.onConfirm(this, e)

    var val = this.data.pval;
    var areas = this.data.areas;
    var detail = this.data.areaDetail.detail;
    detail.province = areas[val[0]].name;
    detail.city = areas[val[0]].city[val[1]].name;
    detail.datavalue = areas[val[0]].code + " " + areas[val[0]].city[val[1]].code;
    if (areas[val[0]].city[val[1]].area && areas[val[0]].city[val[1]].area.length > 0) {

      detail.area = areas[val[0]].city[val[1]].area[val[2]].name;
      detail.datavalue += " " + areas[val[0]].city[val[1]].area[val[2]].code;
      this.getStreet(areas, val);
    } else {
      detail.area = "";
    }

    detail.street = '';
    this.setData({
      'areaDetail.detail': detail,
      streetIndex: 0,
      showPicker: false
    });

    return
  },
  getIndex: function(str, areas) {
    return diyform.getIndex(str, areas)
  },
  //快速添加收货地址
  showaddressview: function(e) {

    var showaddressview = '';
    if (e.target.dataset.type == 'open') {
      showaddressview = true
    } else {
      showaddressview = false
    }
    this.setData({
      showaddressview: showaddressview
    })
  },
  onChange2: function(event) {
    var $this = this;
    var vname = $this.data.areaDetail.detail;
    var bindtype = event.currentTarget.dataset.type;

    var value = $.trim(event.detail.value);
    if (bindtype == 'street') {
      vname.streetdatavalue = $this.data.street[value].code
      value = $this.data.street[value].name;
    }
    vname[bindtype] = value;
    $this.setData({
      'areaDetail.detail': vname
    });
  },
  getStreet: function(areas, val) {
    if (!areas || !val) {
      return;
    }
    var $this = this;
    if (!$this.data.areaDetail.detail.province || !$this.data.areaDetail.detail.city || !this.data.openstreet) {
      return;
    }
    var city = areas[val[0]].city[val[1]].code;
    var area = areas[val[0]].city[val[1]].area[val[2]].code;

    core.get('getstreet', {
      city: city,
      area: area
    }, function(result) {
      var street = result.street;
      var data = {
        street: street
      };
      if (street && $this.data.areaDetail.detail.streetdatavalue) {
        for (var i in street) {
          if (street[i].code == $this.data.areaDetail.detail.streetdatavalue) {
            data.streetIndex = i;
            $this.setData({
              'areaDetail.detail.street': street[i].name
            });
            break;
          }
        }
      }
      $this.setData(data);
    });
  },
  getQuickAddressDetail: function() {
    var $this = this;
    var id = $this.data.id;
    core.get('member/address/get_detail', {
      id: id
    }, function(result) {
      var data = {
        openstreet: result.openstreet,
        show: true
      };
      if (!$.isEmptyObject(result.detail)) {
        var area = result.detail.province + " " + result.detail.city + " " + result.detail.area;
        var index = $this.getIndex(area, $this.data.areas);
        data.pval = index;
        data.pvalOld = index;
        data.areaDetail.detail = result.detail;
      }
      $this.setData(data);
      if (result.openstreet && index) {
        $this.getStreet($this.data.areas, index);
      }
    });
  },
  submitaddress: function() {
    var $this = this;
    var detail = $this.data.areaDetail.detail;
    if ($this.data.posting) {
      return;
    }
    if (detail.realname == '' || !detail.realname) {
      foxui.toast($this, "请填写收件人");
      return;
    }
    if (detail.mobile == '' || !detail.mobile) {
      foxui.toast($this, "请填写联系电话");
      return;
    }
    if (detail.city == '' || !detail.city) {
      foxui.toast($this, "请选择所在地区");
      return;
    }
    if ($this.data.street.length > 0 && (detail.street == '' || !detail.street)) {
      foxui.toast($this, "请选择所在街道");
      return;
    }
    if (detail.address == '' || !detail.address) {
      foxui.toast($this, "请填写详细地址");
      return;
    }

    if (!detail.datavalue) {
      foxui.toast($this, "地址数据出错，请重新选择");
      return;
    }

    detail.id = 0;
    $this.setData({
      posting: true
    });
    core.post('member/address/submit', detail, function(result) {
      if (result.error != 0) {
        $this.setData({
          posting: false
        });
        foxui.toast($this, result.message);
        return;
      }

      detail.id = result.addressid;

      $this.setData({
        showaddressview: false,
        'list.address': detail
      });
      core.toast("保存成功");
    });

  },
  //赠品弹层
  giftPicker: function() {
    this.setData({
      active: 'active',
      gift: true
    })
  },
  //关闭pickerpicker
  emptyActive: function() {
    this.setData({
      active: '',
      slider: 'out',
      tempname: '',
      showcoupon: false,
      gift: false
    });
  },
  radioChange: function(e) {
    // console.log(e.currentTarget.dataset.giftgoodsid);
    this.setData({
      giftid: e.currentTarget.dataset.giftgoodsid,
      gift_title: e.currentTarget.dataset.title,
    })
  },
  /*同城配送*/
  sendclick: function() {
    wx.navigateTo({
      url: '/pages/map/index'
    });
  },
  // 清除表单内容
  clearform: function() {
    var diyform = this.data.diyform;
    var new_fdata = {};
    $.each(diyform, function(k, v) { //lgt 清除表单时保留图片上传功能
      $.each(v, function(key, value) {
        if (value.data_type == 5) {
          diyform.f_data[value.diy_type].count = 0;
          diyform.f_data[value.diy_type].images = [];
          new_fdata[value.diy_type] = diyform.f_data[value.diy_type];
        }
      });
    });
    diyform.f_data = new_fdata;
    this.setData({
      diyform: diyform
    })
  },

  // 取消时间选择时间
  syclecancle: function() {
    this.setData({
      cycledate: false
    });
  },
  //确定选择时间
  sycleconfirm: function() {
    this.setData({
      cycledate: false
    });
  },
  // 周期购 修改送达时间
  editdate: function(e) {
    selectdate.setSchedule(this);
    this.setData({
      cycledate: true,
      create: true,
    });
  },

  //时间选择器 前后月份选择
  doDay: function(e) {
    selectdate.doDay(e, this);
  },
  //周期购选择时间
  selectDay: function(e) {
    selectdate.selectDay(e, this);
    selectdate.setSchedule(this);
  },

  // 弹出发票picker
  showinvoicepicker: function() {
    var tempdata = this.data.list;
    if (tempdata.invoice_type == 0) { //only纸质
      tempdata.invoice_info.entity = true;
    }
    if (tempdata.invoice_type == 1) { //only电子
      tempdata.invoice_info.entity = false;
    }
    this.setData({
      invoicepicker: true,
      list: tempdata
    })
  },
  noinvoicepicker: function() {
    this.setData({
      invoicepicker: false
    })
  },
  // 清空数据
  clearinvoice: function() {
    var tempdata = this.data.list;
    tempdata.invoicename = '';
    this.setData({
      invoicepicker: false,
      list: tempdata
    })
  },
  // 修改电子纸质类型发票
  chaninvoice: function(e) {
    var tempdata = this.data.list;
    if (e.currentTarget.dataset.type == '0') {
      tempdata.invoice_info.entity = false;
    } else {
      tempdata.invoice_info.entity = true;
    }
    this.setData({
      list: tempdata
    })
  },
  // 修改发票类型
  changeType: function(e) {
    var tempdata = this.data.list;
    if (e.currentTarget.dataset.type == '0') {
      tempdata.invoice_info.company = false;
    } else {
      tempdata.invoice_info.company = true;
    }
    this.setData({
      list: tempdata
    })
  },
  // input发票抬头
  invoicetitle: function(e) {
    var tempdata = this.data.list;
    tempdata.invoice_info.title = e.detail.value.replace(/\s+/g, '')
    this.setData({
      list: tempdata
    })
  },

  // input发票税号
  invoicenumber: function(e) {
    var tempdata = this.data.list;
    tempdata.invoice_info.number = e.detail.value.replace(/\s+/g, '')
    this.setData({
      list: tempdata
    })
  },

  // 发票确定按钮
  confirminvoice: function() {
    var tempdata = this.data.list;
    if (!tempdata.invoice_info.company) {
      this.setData({
        invoicenumber: ''
      })
    }
    var str1 = tempdata.invoice_info.entity ? '[纸质] ' : '[电子] ';
    var str2 = tempdata.invoice_info.title + ' ';
    var str3 = tempdata.invoice_info.company ? '（单位: ' + tempdata.invoice_info.number + '）' : '（个人）';
    // console.log(str1+str2+str3);
    tempdata.invoicename = str1 + str2 + str3;
    if (!tempdata.invoice_info.title) {
      foxui.toast(this, "请填写发票抬头");
    } else if (tempdata.invoice_info.company && !tempdata.invoice_info.number) {
      foxui.toast(this, "请填写税号");
    } else {
      this.setData({
        list: tempdata,
        invoicepicker: false
      })
    }
  },

  // 选择会员卡
  selectCard: function() {
    var $this = this;
    $this.setData({
      selectcard: 'in'
    })
  },

  // 不使用会员卡
  cancalCard: function() {
    this.setData({
      cardid: ''
    })
  },

  // 切换会员卡
  changecard: function(e) {
    var $this = this,
      card_info = $this.data.card_info;
    $this.setData({
      selectcard: '',
      cardid: e.currentTarget.dataset.id
    })
    var id = e.currentTarget.dataset.id;

    var args = {
      cardid: id,
      goodsprice: this.data.list.goodsprice,
      dispatch_price: this.data.list.dispatch_price,
      discountprice: this.data.list.discountprice
    }
    core.post('order/create/getcardprice', args, function(data) {
      if (id != '') {
        if (data.error == 0) {
          var obj = {
            carddiscount_rate: data.carddiscount_rate,
            carddiscountprice: data.carddiscountprice,
            cardid: data.cardid,
            cardname: data.name,
            dispatch_price: data.dispatch_price,
            totalprice: data.totalprice,
            comboprice: 0
          }
          $this.setData(obj);
          $this.caculate($this.data.list);
        } else {
          core.alert(data.message);
        }
      } else {
        var card_obj = {
          cardid: '',
          selectcard: '',
          cardname: '',
          carddiscountprice: 0,
          ispackage: false
        }
        var comboprice = ($this.data.originalprice - $this.data.list.goodsprice).toFixed(2);
        if ($this.data.options.goods) {
          card_obj.ispackage = true;
          card_obj.comboprice = comboprice;
        }
        $this.setData(card_obj);
        if (!$.isEmptyObject($this.data.list)) {
          $this.caculate($this.data.list);
        }
      }
    }, true);

  },

  // 关闭选择会员卡弹窗
  closeCardModal: function() {
    var $this = this;
    $this.setData({
      selectcard: ''
    })
  },

  selectPro(e) {
    let listType = e.currentTarget.dataset.listType,
      idx = e.currentTarget.dataset.idx;

    let giftList = [...this.data.giftsuperlist]
    let list = giftList[listType]
    let chosenum = list.chosenum
    let listItem = list.giftgoodsid
    // 判断已选择多少
    let ischosenum = 0
    listItem.map((v, i) => {
      if (v.selected == 'checked') {
        ischosenum += 1
      }
    })
    console.log(ischosenum)
    //如果已选择的 大于 该选择的
    if (ischosenum >= chosenum) {
      // wx.showToast({
      //   title: "已达上限",
      //   icon: 'none'
      // })
      if (listItem[idx].selected == "checked") {
        listItem[idx].selected = "nocheck"
        ischosenum -= 1
      }
    } else {
      if (listItem[idx].selected == "checked") {
        listItem[idx].selected = "nocheck"
        ischosenum -= 1
      } else {
        listItem[idx].selected = "checked"
      }

    }

    this.setData({
      giftsuperlist: giftList
    })

    console.log(this.data.giftsuperlist)
  },
  /**
   * 原生添加地址
   */
  selectAddress() {
    let that = this
    wx.chooseAddress({
      success: function (res2) {
        console.log(res2)
        that.setData({
          addressDetail: {
            userName: res2.userName,
            telNumber: res2.telNumber,
            cityName: res2.cityName,
            countyName: res2.countyName,
            detailInfo: res2.detailInfo,
            nationalCode: res2.nationalCode,
            postalCode: res2.postalCode,
            provinceName: res2.provinceName,
            full_region: res2.provinceName + res2.countyName + res2.detailInfo
          }
        });
        wx.setStorageSync('address', that.data.addressDetail);
      }
    })
    // wx.getSetting({ //先获取用户当前的设置  
    //   success(res) {
    //     if (!res.authSetting['scope.address']) {
    //       wx.authorize({
    //         scope: 'scope.address',
    //         success(res) {

    //           console.log(res.errMsg); //用户授权后执行方法
    //         },
    //         fail(res) {
    //           //用户拒绝授权后执行  
    //           wx.openSetting({})
    //         }
    //       })
    //     } else {
          
    //     }
    //   }
    // })
  }
});