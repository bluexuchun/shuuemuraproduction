// pages/makeCard/makeCard.js
// var util = require('../../utils/util.js');
// var api = require('../../config/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: true,
    share: false,
    ani: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var that = this;
    this.setData({
      text: options.sendWord,
      nickName: options.nickName,
      videoUrl: options.videoUrl,
    });
    setTimeout(function () {
      that.setData({
        ani: "ani",
        shareText: options.sendWord
      })
    }, 10)
  },
  //寄语的动画效果
  showText(str) {
    var that = this;
    var text = str;
    console.log(text.length);
    var str = "";
    var ind = 0;
    var timer = setInterval(function () {
      if (ind > text.length) {
        setTimeout(function () {
          clearInterval(timer);
          that.setData({
            share: true,
          })
        }, 2700)
      } else {
        str += text.charAt(ind);
        console.log(text.charAt(ind))
        that.setData({
          shareText: str,
        }, function () {
          ind++;
          if (ind > text.length) {
            that.setData({
              opaci: "opac"
            })

          }
        })
      }
    }, 400)
  },
  //视频缓冲
  waitPlay() {
    // wx.showLoading({
    //   title: '缓冲中',
    // })
  },
  play() {
    wx.hideLoading();
  },
  endPlay() {
    var that = this;
    that.setData({
      show: false,

    }, function () {
      
      // that.showText(that.data.text);
    })
  },
  errorPlay() {
    util.showErrorToast("视频播放错误");
  },
  goIndex(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  goC(){
    wx.navigateTo({
      url: '/pages/christmas/christmas',
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

})