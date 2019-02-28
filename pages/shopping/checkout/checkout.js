// var util = require('../../../utils/util.js');
// var api = require('../../../config/api.js');
// var sensors = require('../../../utils/sensorsdata.min.js');

var app = getApp();

Page({
  data: {
    checkedGoodsLists: [],
    giftsList: [],
    address: "",
    actualPrice: 0.00,
    freePrice: 0,
    couponId: '',
    orderSuccess: false,
    freeGoodsList: [],
    moneyGifs: [],
    moneyGiftProductIds: [],
    dzGiftProductIds: [],
    sign: true,
    yun: 0,
    extraPrice: 0,
  },
  onLoad: function (options) {
    console.log(options.goodsInfo)
    // console.log(JSON.parse(options.goodsInfo))
    if (options && options.goodsInfo) {
      var checkedGoods = [];
      checkedGoods.push(JSON.parse(options.goodsInfo))
      wx.setStorageSync('checkedGoods', checkedGoods);
    }
    // 页面显示
    wx.showLoading({
      title: '加载中...',
    })
    this.getCheckoutInfo();
    // this.getGiftLists()
    console.log(wx.getStorageSync('checkedGoods'))
  },
  getCheckoutInfo() {
    let checkedGoods = wx.getStorageSync('checkedGoods');
    console.log('***********', checkedGoods)
    // let flag = false
    // checkedGoods.forEach((item)=>{
    //   if (item.type === "1"){
    //     flag = true
    //   }
    // })
    this.setData({
      'checkedGoodsList': checkedGoods
    });
    this.getAddress()
    // this.getActualPrice()
    this.getGiftLists()
    wx.hideLoading()
  },
  getActualPrice() {
    let actualPrice = 0;
    let checkedGoods = wx.getStorageSync('checkedGoods');
    this.data.checkedGoodsList.forEach((item) => {
      actualPrice += (item.retail_price * item.number)
    });
    let date = new Date();
    let currentTime = date.getTime();
    let freightJudgeFee = this.data.freightJudgeFee;
    let letterJudgeFee = this.data.letterJudgeFee;
    let freightFee = this.data.freightFee;
    let letterFee = this.data.letterFee;
    let blackGoldenletterFeeStartTime = this.data.blackGoldenletterFeeStartTime;
    let blackGoldenletterFeeEndTime = this.data.blackGoldenletterFeeEndTime;
    console.log("运费门槛" + freightJudgeFee + "刻字费门槛" + letterJudgeFee + "运费" + freightFee + "刻字费" + freightFee);
    if (actualPrice < freightJudgeFee) {
      this.setData({
        yun: freightFee
      })
    }
    //购买小于一定价格 加收刻字费  特定时间内特定商品 不收刻字费
    var extraNumber = 0;
    if (actualPrice < letterJudgeFee) {
      checkedGoods.forEach((item, index) => {
        if (item.goodsDiyPack && item.goodsDiyPack.desc) {
          if (!(item.productType == 1 && (currentTime > blackGoldenletterFeeStartTime) && (currentTime < blackGoldenletterFeeEndTime))) {
            extraNumber = extraNumber + item.number;
          }

        }
      })
      this.setData({
        extraPrice: extraNumber * letterFee
      })
    }
    console.log(actualPrice.toFixed(2))
    this.setData({
      actualPrice: Number(actualPrice.toFixed(2))
      // actualPrice: actualPrice
    })
  },
  getAddress() {
    if (wx.getStorageSync('address') !== "" || wx.getStorageSync('address') !== undefined) {
      this.setData({
        address: wx.getStorageSync('address')
      })
    }
  },
  selectAddress() {
    let that = this;
    // app.sensors.track('PageClick', {
    //   click_content: "收货地址",
    //   $url_path: util.getRoute().$url_path,
    //   $url_query: util.getRoute().$url_query ? util.getRoute().$url_query : "",
    // });
    wx.getSetting({//先获取用户当前的设置  
      success(res) {
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success(res) {

              console.log(res.errMsg);//用户授权后执行方法
            },
            fail(res) {
              //用户拒绝授权后执行  
              wx.openSetting({})
            }
          })
        } else {
          wx.chooseAddress({
            success: function (res2) {
              that.setData({
                address: {
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
              wx.setStorageSync('address', that.data.address);

            }
          })
        }
      }
    })

  },
  getGiftLists() {
    let giftsList
    let couponId = ''
    console.log(this)
    let freePrice = 0;
    let that = this;
    let checkedGoods = wx.getStorageSync('checkedGoods');
    checkedGoods.forEach((item) => {
      if (item.is_full_gift) {
        freePrice += (item.retail_price * item.number)
      }
    })
    console.log("总价" + freePrice);
    app.showYslLoading(that);
    util.request(api.CouponListGifts, "", 'POST').then(res => {
      console.log(res)
      app.hideYslLoading(that);
      if (res.errno === 0) {
        giftsList = res.data.couponGift
        // giftsList.filter((element, index, array) => {
        //   return element.couponDesc = JSON.parse(element.couponDesc)
        // })
        giftsList.filter((element, index, array) => {
          return element.checked = true
        })
        giftsList.forEach((item) => {
          couponId += parseInt(item.id) + ';'
        })

        let extraGiftList = res.data.moneyGift[0], dzGiftList,
          nextExtraGiftList = res.data.moneyGift[0], minPrice = res.data.moneyGift[0].minPrice, maxPrice = res.data.moneyGift[0].maxPrice;

        res.data.moneyGift.some((item, idx) => {
          if (freePrice >= item.minPrice && (!item.maxPrice || freePrice < item.maxPrice)) {
            extraGiftList = res.data.moneyGift[idx];
            if (res.data.moneyGift.length === idx + 1) {
              nextExtraGiftList = null;
            } else {
              nextExtraGiftList = res.data.moneyGift[idx + 1];
            }
            return false;
          }
        })
        if (res.data.dzGift) {
          dzGiftList = res.data.dzGift[0]
          res.data.dzGift.some((item, idx) => {
            if (freePrice >= item.minPrice && (!item.maxPrice || freePrice < item.maxPrice)) {
              dzGiftList = res.data.dzGift[idx];
              return false;
            }
          })
        } else {
          dzGiftList = {}
        }
        console.log("运费门槛" + res.data.freightJudgeFee + "刻字费门槛" + res.data.letterJudgeFee);
        this.setData({
          extraGiftList: extraGiftList,
          nextExtraGiftList: nextExtraGiftList,
          freeGoodsList: giftsList,
          dzGiftList: dzGiftList,
          couponId: couponId.substr(0, couponId.length - 1),
          minPrice: minPrice,
          maxPrice: maxPrice,
          freePrice: freePrice,
          letterJudgeFee: res.data.letterJudgeFee,
          freightJudgeFee: res.data.freightJudgeFee,
          letterFee: res.data.letterFee,
          freightFee: res.data.freightFee,
          blackGoldenletterFeeStartTime: res.data.blackGoldenletterFeeStartTime,
          blackGoldenletterFeeEndTime: res.data.blackGoldenletterFeeEndTime,

        }, function () {
          that.getActualPrice();
        })
      } else {
        util.showErrorToast('失败');
      }
    });
  },
  submitOrder() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    });
    if (!that.data.sign) {
      wx.hideLoading();
      return false;
    }
    that.setData({
      sign: false
    })
    if (this.data.orderSuccess) {
      wx.hideLoading();
      return false;
    }
    if (wx.getStorageSync('telInput') == undefined || wx.getStorageSync('telInput') == '') {
      that.setData({
        sign: true
      })
      wx.hideLoading();
      wx.showModal({
        title: '请先绑定手机号',
        content: '',
        success: function (res) {
          if (res.confirm) {
            wx.setStorageSync('backUrltype', '1')
            wx.redirectTo({
              url: '/pages/ucenter/pefectInfo/pefectInfo',
            })
          } else {
            console.log('用户点击取消')
          }

        }
      })
    } else if (this.data.address == '') {
      that.setData({
        sign: true
      })
      wx.hideLoading();
      util.showErrorToast('请选择收货地址');
    } else {
      let checkedGoodsLists = []
      console.log(this.data.checkedGoodsList);
      this.data.checkedGoodsList.forEach((item) => {
        if (item.boxInfo) {
          var boxCode = item.boxInfo.boxCode;
        } else {
          var boxCode = "";
        }
        checkedGoodsLists.push({
          productId: item.productId,
          number: item.number,
          goodsDiyCard: item.goodsDiyCard,
          goodsDiyPack: item.goodsDiyPack,
          remark: item.remark,
          boxCode: boxCode,
        })
      })
      let checkedAddress = {
        userName: this.data.address.userName,
        telNumber: this.data.address.telNumber,
        provinceName: this.data.address.provinceName,
        cityName: this.data.address.cityName,
        countyName: this.data.address.countyName,
        detailInfo: this.data.address.detailInfo,
        postalCode: Number(this.data.address.postalCode),
        email: ""
      }
      let giftId = "";
      this.data.freeGoodsList.forEach((item) => {
        if (item.type != "6") {
          giftId += item.id + ",";
        }
      })
      giftId = giftId.substr(0, giftId.length - 1);
      console.log(giftId);
      let OrderSubmitInfo = {
        checkedGoodsLists: checkedGoodsLists,
        checkedAddress: checkedAddress,
        moneyGiftProductIds: this.data.moneyGiftProductIds.map((p) => p.id).join(','),
        dzGiftProductIds: this.data.dzGiftProductIds.map((p) => p.id).join(','),
        giftIds: giftId //赠品的类型 
      }
      console.log(OrderSubmitInfo)
      // return false;
      util.request(api.OrderSubmit, OrderSubmitInfo, 'POST').then(res => {
        console.log(res)
        that.setData({
          sign: true
        })
        wx.hideLoading();
        if (res.errno === 0) {


          var checkedGoods = wx.getStorageSync('checkedGoods');
          var addressInfo = wx.getStorageSync('address');
          var product_id_list = [];
          checkedGoods.forEach((item) => {
            product_id_list.push(item.goods_sn);
          });
          // app.sensors.track('SubmitOrder', {
          //   order_id: String(res.data.orderid),
          //   product_id_list: product_id_list,
          //   order_name: addressInfo.userName,
          //   gender: wx.getStorageSync("userInfo").gender == 1 ? "男" : "女",
          //   order_phone: wx.getStorageSync('telInput'),
          //   order_province: addressInfo.provinceName,
          //   order_city: addressInfo.cityName,
          //   order_district: addressInfo.countyName,
          //   order_address: addressInfo.full_region,
          //   order_price: that.data.actualPrice,
          //   transp_cost: that.data.yun,
          //   service_cost: that.data.extraPrice,
          // });
          checkedGoods.forEach((item, index) => {
            console.log(index)
            for (var i = 0; i < item.number; i++) {
              // app.sensors.track('SubmitGoods', {
              //   order_id: String(res.data.orderid),
              //   product_id: String(item.goods_sn),
              //   goods_name: item.goods_name,
              //   lettering: (item.goodsDiyPack && item.goodsDiyPack.desc) ? "是" : "否",
              //   card_type: (item.goodsDiyCard && item.goodsDiyCard.sku && item.goodsDiyCard.desc) ? "空白卡" : (item.goodsDiyCard && item.goodsDiyCard.sku && !item.goodsDiyCard.desc) ? "手写卡" : "无卡",
              //   order_name: addressInfo.userName,
              //   order_phone: wx.getStorageSync('telInput'),
              //   order_province: addressInfo.provinceName,
              //   order_city: addressInfo.cityName,
              //   order_district: addressInfo.countyName,
              //   order_address: addressInfo.full_region,
              //   product_price: item.retail_price,
              // });
            }

          });

          wx.showToast({
            title: '下单成功'
          })
          this.setData({
            orderSuccess: true
          })
          util.pay(res.data.orderid).then((response) => {
            console.log(response)
            if (response.code) {
              var date = new Date();
              if (res.data.firstBuy) {
                // sensors.setOnceProfile({
                //   first_order_time: util.formatTime(date)
                // })
              }
              // sensors.setProfile({
              //   latest_order_time: util.formatTime(date)
              // })
              // app.sensors.track('PayOrder', {
              //   order_id: String(res.data.orderid),
              //   product_id_list: product_id_list,
              //   order_name: addressInfo.userName,
              //   gender: wx.getStorageSync("userInfo").gender == 1 ? "男" : "女",
              //   order_phone: wx.getStorageSync('telInput'),
              //   order_province: addressInfo.provinceName,
              //   order_city: addressInfo.cityName,
              //   order_district: addressInfo.countyName,
              //   order_address: addressInfo.full_region,
              //   order_price: that.data.actualPrice,
              //   transp_cost: that.data.yun,
              //   service_cost: that.data.extraPrice,
              // });
              checkedGoods.forEach((item) => {
                for (var i = 0; i < item.number; i++) {
                  // app.sensors.track('PayGoods', {
                  //   order_id: String(res.data.orderid),
                  //   product_id: String(item.goods_sn),
                  //   goods_name: item.goods_name,
                  //   lettering: (item.goodsDiyPack && item.goodsDiyPack.desc) ? "是" : "否",
                  //   card_type: (item.goodsDiyCard && item.goodsDiyCard.sku && item.goodsDiyCard.desc) ? "空白卡" : (item.goodsDiyCard && item.goodsDiyCard.sku && !item.goodsDiyCard.desc) ? "手写卡" : "无卡",
                  //   order_name: addressInfo.userName,
                  //   order_phone: wx.getStorageSync('telInput'),
                  //   order_province: addressInfo.provinceName,
                  //   order_city: addressInfo.cityName,
                  //   order_district: addressInfo.countyName,
                  //   order_address: addressInfo.full_region,
                  //   product_price: item.retail_price,
                  // });
                }
              });
            }
            wx.navigateTo({
              url: '/pages/ucenter/orderDetail/orderDetail?id=' + res.data.orderid + "&code=1",
            })
          })
        } else {
          wx.showToast({
            title: res.errmsg,
            icon: 'none'
          })
        }
      });
    }
  },
  checkboxChange(e) {
    let chooseIds = e.detail.value
    let couponId = ''
    chooseIds.forEach((item) => {
      couponId += parseInt(item) + ';'
    })
    this.setData({
      couponId: couponId.substr(0, couponId.length - 1)
    })
    let giftsList = this.data.giftsList
    let chooseGiftList = []
    giftsList.forEach((item, index) => {
      item.checked = false
    })
    giftsList.forEach((item, index) => {
      let checked = "giftsList[" + index + "].checked";
      chooseIds.forEach((item2, index2) => {
        if (parseInt(item2) == item.id) {
          item.checked = true
          chooseGiftList.push(item)
        }
      });
    })
    // this.setData({
    //   giftsList: chooseGiftList
    // })
  },
  isShowImg(id) {
    var idList = [30055, 30195, 30196, 30198, 30199, 30197, 30191]
    return idList.every((item) => {
      item != id
    })
  },
  selectPro(e) {
    let listType = e.currentTarget.dataset.listType,
      idx = e.currentTarget.dataset.idx;

    let list = this.data[listType],
      listIds = listType === 'extraGiftList' ? this.data.moneyGiftProductIds : this.data.dzGiftProductIds;
    console.log(this.data.actualPrice, this.data.freePrice, list.minPrice)
    let product = list.productList[idx];
    if (this.data.freePrice < list.minPrice) {
      return false;
    } else if (!product.selected && listIds.length === list.limitNum) {
      wx.showToast({
        title: "已达上限",
        icon: 'none'
      })
      return false;
    }
    product.selected = !product.selected;

    let pkey = listType + '.productList[' + idx + '].selected'
    let _data = {}
    _data[listType === 'extraGiftList' ? 'moneyGiftProductIds' : 'dzGiftProductIds'] = list.productList.filter((p) => p.selected)
    _data[pkey] = product.selected
    this.setData(_data)
  },
  selectPro1(e) {
    let listType = e.currentTarget.dataset.listType,
      idx = e.currentTarget.dataset.idx;

    let list = this.data[listType],
      listIds = listType === 'extraGiftList' ? this.data.moneyGiftProductIds : this.data.dzGiftProductIds;
    console.log(this.data.actualPrice, this.data.freePrice, list.minPrice)
    let product = list.productList[idx];
    if (this.data.actualPrice < list.minPrice) {
      return false;
    } else if (!product.selected && listIds.length === list.limitNum) {
      wx.showToast({
        title: "已达上限",
        icon: 'none'
      })
      return false;
    }
    product.selected = !product.selected;

    let pkey = listType + '.productList[' + idx + '].selected'
    let _data = {}
    _data[listType === 'extraGiftList' ? 'moneyGiftProductIds' : 'dzGiftProductIds'] = list.productList.filter((p) => p.selected)
    _data[pkey] = product.selected
    this.setData(_data)
  },
  onShareAppMessage: function () {
    return {
      title: 'YSL圣罗兰美妆官方商城',
      imageUrl: '/static/images/allshare.jpg'
    }
  }
})