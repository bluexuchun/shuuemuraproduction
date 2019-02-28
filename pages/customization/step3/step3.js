// pages/customization/step3/step3.js
var app = getApp(),
  $ = app.requirejs('jquery'),
  core = app.requirejs('core'),
  foxui = app.requirejs('foxui'),
  diyform = app.requirejs('biz/diyform');
  var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    boxList: [],
    active: "",
    fengtaoid:'',
    end:"",
    sendStep:"",
    firstStep:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var that = this;
    this.setData({
      id: options.id,
      cartid: options.cartId,
      boxCode: options.boxCode,
      // goodsId:options.goodsId,
    }, function () {
      if(options.fengtaoid){
        that.setData({
          fengtaoid: options.fengtaoid
        })
      }
      that.getList();
    })

    if(options.end){
      this.setData({
        end:JSON.parse(options.end)
      })
    }
    if (options.sendStep){
  this.setData({
    sendStep: JSON.parse(options.sendStep)
  })
}

if (options.firstStep) {
  this.setData({
    firstStep: JSON.parse(options.firstStep)
  })
}
    // 判断是否修改
    // if (options.cartid != undefined) {
    //   this.getUpdate(options.cartid)
    //   this.setData({
    //     isUpdate: true,
    //     cartid: options.cartid
    //   })
    // }
    // else {
    //   goodsInfo.goodsDiyPack = JSON.parse(options.goodsDiyPack)
    //   goodsInfo.goodsSn = options.goodsSn
    //   goodsInfo.goodsId = options.goodsId
    //   goodsInfo.remark = options.remark
    // }
  },
  getList() {
    var that = this;
    console.log(that.data.id)
    wx.showLoading({
      title: '加载中',
    })
    core.get('goods/get_packet', { id: that.data.id}, function(res){
      console.log(res);
      wx.hideLoading();
      var data=res.packet;
          // if (item.boxCode == that.data.boxCode) {
          //   sign = false;
          //   that.setData({
          //     active: item.id,
          //     fengtaoimg:item.img,
          //     goodsBoxCode: item.uniacid
          //   })
          // }
        that.setData({
          boxList: res.packet
        })
        console.log(that.data.fengtaoid);
        if(that.data.fengtaoid==''){
          console.log('aaa');
          that.setData({
            // fengtaoimg: res.packet[0].img,
            // active: res.packet[0].id,
            // goodsBoxCode: res.packet[0].uniacid
          })
        }else{
          console.log('ssss');
          var ftid=that.data.fengtaoid;
          for(var i=0;i<res.packet.length;i++){
            if(ftid==res.packet[i].id){
              console.log(i);
              that.setData({
                fengtaoimg: res.packet[i].img,
                active: res.packet[i].id,
                goodsBoxCode: res.packet[i].uniacid
              })
            }
          }
        }
    })
  },
  selectBox: function (e) {
    var index = e.currentTarget.dataset.id;
    var fengtaoimg=e.currentTarget.dataset.url;
    console.log(e)
    this.setData({
      active: index,
      fengtaoimg:fengtaoimg,
      goodsBoxCode: e.currentTarget.dataset.goodsboxcode
    })
  },
  addCart() {
    let that = this
    let num = 0
    let addFlag = true
        that.add()
        // let cartList = res.data.cartList
        // if (cartList.length !== 0) {
        //   cartList.forEach((item) => {
        //     if (item.id === goodsInfo.proId) {
        //       addFlag = false
        //       // 修改购物车信息
        //       num = item.number

        //       if (num < 5) {
        //         that.add()
        //       } else {
        //         util.showErrorToast('最多买5个哦');
        //       }
        //     }
        //   })
        //   if (addFlag) {
        //     that.add()
        //   }
        // } else {
        //   that.add()
        // }
  },

  add() {
    let that = this
    core.get('member/cart/add', { fengtaoid:-1,fengtaoimg:'',cid:that.data.cartid,id:that.data.id}, function(res){
      wx.navigateTo({
        url: '/pages/customization/step3/step3?goodsId=' + that.data.cartid,
      })
    })
  },

  jumpStep() {
    this.addCart()
  },

  cancel() {
    wx.navigateBack({
      delta: 1
    })
  },

  saveData() {
    // this.data.cards.forEach((item) => {
    //   if (item.id === this.data.currentCard) {
    //     goodsDiyCard.sku = item.sku
    //   }
    // })
    // goodsDiyCard.desc = this.data.inputValue
    if (!this.data.active) {
      util.showErrorToast('请选择一个封套');
      return false;
    }
    let that = this
    console.log(that.data.cartid, that.data.goodsBoxCode);
    wx.showLoading({
      title: '保存中',
    })
    console.log(that.data.cartid, that.data.id,that.data.goodsBoxCode,that.data.fengtaoimg, that.data.active);
    // 修改购物车
    core.post('member/cart/add',
     {
       id: that.data.id,
       cid: that.data.cartid,
       fengtaoid: that.data.active,
       fengtaoimg: that.data.fengtaoimg,
       goodsBoxCode: that.data.goodsBoxCode,
       jieduaner: JSON.stringify(that.data.sendStep) ,
       jieduanyi: JSON.stringify(that.data.firstStep) ,
       remark: that.data.end.remark, 
      },
     
      function (res) {
        if (res.error === 0) {
          wx.showToast({
            icon: 'success',
            title: '保存成功',
            success: function () {
              wx.switchTab({
                url: '../../member/cart/index',
              })
            }
          })
        }
    })
    // core.get('member/cart/add', {
    //   id: that.data.id,
    //   cid: that.data.cartid,
    //   fengtaoid:that.data.active,
    //   fengtaoimg:that.data.fengtaoimg,
    //   goodsBoxCode: that.data.goodsBoxCode,
    // },function(res){
    //   // 埋点
    //   app.sensors.track('SubmitToCart', {
    //     product_id: that.data.id,
    //     submit_type: "direct",
    //     goods_name: that.data.goodsBoxCode
    //   });
    //   wx.hideLoading();
    //   console.log(that.data.cartid, that.data.goodsBoxCode, that.data.active);
    //   if (res.error === 0) {
    //     wx.showToast({
    //       icon: 'success',
    //       title: '保存成功',
    //       success: function () {
    //         wx.switchTab({
    //           url: '../../member/cart/index',
    //         })
    //       }
    //     })
    //   }
    // })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})