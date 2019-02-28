// pages/makeCard/makeCard.js
// var util = require('../../utils/util.js');
// var api = require('../../config/api.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: true,
    share: false,
    ani: "",
    ro: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      puzzleId: options.puzzleId,
      text: options.shareText,
      videourl: options.videourl,
      id: options.id,
      imgurl: options.imgurl,
    });

    var that = this;
    setTimeout(function () {
      that.setData({
        ani: "ani",
        shareText: that.data.text,
        rotate1: "rotate1",
        show: false,
      })
    }, 3000)
    setTimeout(function () {
      that.setData({
        ro: false,
      })
    }, 4000)
  },
  // shareInfo(){
  //   app.sensors.getPresetProperties()
  //   app.sensors.track('ShareToTA', {

  //   });
  // },
  onShareAppMessage: function (res) {
    console.log(res);
    if (res.target.id == 1) {
      var that = this;
      return {
        title: '查收一份我送你的专属密语',
        imageUrl: 'https://yslvday.blob.core.chinacloudapi.cn/yslvday/%E5%9C%A3%E8%AF%9E%E6%B4%BB%E5%8A%A8/%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%9C%A3%E8%AF%9E%E6%B4%BB%E5%8A%A8%E5%9B%BE1018/6%20%E5%88%86%E4%BA%AB%E7%9A%84%E7%BC%A9%E7%95%A5%E5%9B%BE/6.%E5%88%86%E4%BA%AB_%E5%93%81%E7%89%8Clogo%E5%9B%BE500-400.jpg',
        path: "../../friendPuzzle/friendPuzzle?id=" + that.data.id,
      }
    } else if (res.target.id == 2) {
      return {
        title: '查收一份我送你的专属密语',
        imageUrl: 'https://yslvday.blob.core.chinacloudapi.cn/yslvday/%E5%9C%A3%E8%AF%9E%E6%B4%BB%E5%8A%A8/%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%9C%A3%E8%AF%9E%E6%B4%BB%E5%8A%A8%E5%9B%BE1018/6%20%E5%88%86%E4%BA%AB%E7%9A%84%E7%BC%A9%E7%95%A5%E5%9B%BE/6.%E5%88%86%E4%BA%AB_%E5%93%81%E7%89%8Clogo%E5%9B%BE500-400.jpg',
        path: "../../friendPuzzle/friendPuzzle?id=" + that.data.id,
      }
    }

  },
  //视频缓冲
  waitPlay(e) {
    console.log(e)
    // wx.showLoading({
    //   title: '缓冲中',
    // })
  },
  goIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  play() {
    wx.hideLoading();
  },
  endPlay() {
    var that = this;
    that.setData({
      show: false,

    }, function () {
      setTimeout(function () {
        that.setData({
          ani: "ani",
          shareText: that.data.text
        })
      }, 10)
      // that.showText();
    })
  },
  errorPlay() {
    util.showErrorToast("视频播放错误");
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
    var that = this;
    return {
      title: '查收一份我送你的专属密语',
      imageUrl: 'https://yslvday.blob.core.chinacloudapi.cn/yslvday/%E5%9C%A3%E8%AF%9E%E6%B4%BB%E5%8A%A8/%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%9C%A3%E8%AF%9E%E6%B4%BB%E5%8A%A8%E5%9B%BE1018/6%20%E5%88%86%E4%BA%AB%E7%9A%84%E7%BC%A9%E7%95%A5%E5%9B%BE/6.%E5%88%86%E4%BA%AB_%E5%93%81%E7%89%8Clogo%E5%9B%BE500-400.jpg',
      path: "/pages/friendPuzzle/friendPuzzle?id=" + that.data.id,
    }
  },

})