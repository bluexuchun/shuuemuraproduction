// pages/authloading/authloading.js
var app = getApp();
var core = require('./../../utils/util.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = app.getCache("userinfo")
    console.log(userInfo)
    let url = ''
    if(!userInfo || userInfo.needauth == 1){
      url = '/pages/message/auth/index'
      
    }else{
      url = '/pages/index/index'
    }
    setTimeout(() => {
      wx.reLaunch({
        url: url,
      })
    },1000)
    
  },

})