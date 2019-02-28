// pages/christmas/christmas.js
var app = getApp();
var core = app.requirejs('core');
var parser = app.requirejs('wxParse/wxParse');
var diypage = app.requirejs('biz/diypage');
var diyform = app.requirejs('biz/diyform');
var $ = app.requirejs('jquery');
Page({
  

  /**
   * 页面的初始数据
   */
  data: {
    christmas: [{ url: "https://yslvday.blob.core.chinacloudapi.cn/yslvday/圣诞活动/小程序圣诞活动图1018/2%20LP/2.LP1_卡片750-750.jpg", stepUrl: "https://yslvday.blob.core.chinacloudapi.cn/yslvday/10-24step1.png", type: 1 }, { url: "https://yslvday.blob.core.chinacloudapi.cn/yslvday/%E5%9C%A3%E8%AF%9E%E6%B4%BB%E5%8A%A8/%E5%8D%A1%E7%89%87%E6%9B%BF%E6%8D%A2.jpg", stepUrl: "https://yslvday.blob.core.chinacloudapi.cn/yslvday/%E5%9C%A3%E8%AF%9E%E6%B4%BB%E5%8A%A8/1023TISHI/STEP2.png", type: 1 }, { url: "https://yslvday.blob.core.chinacloudapi.cn/yslvday/%E5%9C%A3%E8%AF%9E%E6%B4%BB%E5%8A%A8/1023TISHI/Noel-2018_SLdigit_gift_18021.jpg", stepUrl: "https://yslvday.blob.core.chinacloudapi.cn/yslvday/%E5%9C%A3%E8%AF%9E%E6%B4%BB%E5%8A%A8/1023TISHI/STEP3.png", type: 1 }],
    time:3000,
    play:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var videoContext = wx.createVideoContext('myVideo')
    var that = this;
    setTimeout(function(){
      videoContext.play();
      console.log(that.data.play)
    },that.data.time*2)

    core.get('sale/cardmessage/cardmessage',{},function(res){
      console.log(res);
      that.setData({
        christmas:res.data,
        page1:res.page1
      })
    })
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