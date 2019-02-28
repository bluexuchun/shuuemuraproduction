// const util = require('../../../utils/util.js');
// var api = require('../../../config/api.js');
var app = getApp();
Page({
  data: {
    telInput: wx.getStorageSync('telInput'),
    codeInput: '',
    isCheck: false,
    codeValue: '发送验证码',
    isSend: false
  },
  formSubmit (e) {
    let that = this
    let urlType = wx.getStorageSync('backUrltype')
    this.testTelInput()
    if (this.data.codeInput == ''){
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none'
      })
      return false
    }
    if (!this.data.isCheck) {
      wx.showToast({
        title: '请同意隐私条款',
        icon: 'none'
      })
      return
    }
    util.request(api.checkCode, { phone: this.data.telInput, msgCode: this.data.codeInput }, 'POST').then(function (res) {
      if (res.errno === 0) {
        wx.setStorageSync('telInput', that.data.telInput)
        var pages = getCurrentPages(); // 当前页面  
        var beforePage = pages[pages.length - 1]; // 前一个页面  
        // app.sensors.getPresetProperties()
        // app.sensors.track('PhoneBinded', {
          
        // });
        wx.showModal({
          title: '绑定成功',
          showCancel: false
        })
        switch (urlType) {
          case '1':
            wx.navigateTo({
              url: '/pages/shopping/checkout/checkout',
            })
            break;
          default:
            wx.switchTab({
              url: '/pages/ucenter/index/index'
            })
            break;
        }
      } else {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: '发送验证码失败',
          mask: true
        });
      }
    });
  },
  bindkeyin:function(e){
    this.setData({
      telInput: e.detail.value
    })
  },
  testTelInput(){
    var reg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|17[0-9]|18[0-9])\d{8}$/
    if (!reg.test(this.data.telInput)) {
      wx.showToast({
        title: '手机号码有误',
        icon: 'none'
      })
      return false
    } else {
      return true
    }
  },
  sendCode: function(e){
    if (this.testTelInput()){
      // 获取验证码
      this.setData({
        isSend: true
      })
      var that = this
      var minute = 60
      var tid = setInterval(function () {
        minute--
        if (minute <= 0) {
          clearInterval(tid)
          that.setData({
            isSend: false
          })
          that.setData({
            codeValue: '重新发送'
          })
        }
        else {
          that.setData({
            codeValue: '(' + minute + ')'
          })
        }
      }, 1000);
      util.request(api.SendCode, { phone: this.data.telInput }, 'POST').then(function (res) {
        if (res.errno === 0) {
          wx.showToast({
            title: res.data
          });
          // app.sensors.track('PageClick', {
          //   click_content: "发送验证码",
          //   $url_path: util.getRoute().$url_path,
          //   $url_query: util.getRoute().$url_query ? util.getRoute().$url_query : "",
          // });
        } else {
          wx.showToast({
            image: '/static/images/icon_error.png',
            title: '发送验证码失败',
            mask: true
          });
        }
      });
    }
  },
  checkboxChange: function (e) {
    var temp = e.detail.value!=''?true:false
    this.setData({
      isCheck: temp
    })
  },
  linkRule: function () {
    // wx.setStorageSync('telInput', this.data.telInput)
    wx.navigateTo({
      url: '../rules/rules',
    })
  },
  linkPrivate: function () {
    // wx.setStorageSync('telInput', this.data.telInput)
    wx.navigateTo({
      url: '../private/private',
    })
  },
  codeInput (e) {
    this.setData({
      codeInput: e.detail.value
    })
  },
  onShow () {
    this.setData({
      telInput: wx.getStorageSync('telInput')
    })
  },
  onShareAppMessage: function () {
    return {
      title: 'YSL圣罗兰美妆官方商城',
      imageUrl: '/static/images/allshare.jpg'
    }
  }
})