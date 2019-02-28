// pages/customCard/customCard.js
var app = getApp();
var core = app.requirejs('core');
var $ = app.requirejs('jquery');
var diyform = app.requirejs('biz/diyform');
var goodspicker = app.requirejs('biz/goodspicker');
var foxui = app.requirejs('foxui');
let maxLen = 25;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ind: -1,
    able: false,
    canGet: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.getCardList();
    if (wx.getStorageSync('userInfo')) {
      this.setData({
        canGet: false,
      })
    }
  },
  getUserInfo: function(res) {
    wx.getUserInfo({
      withCredentials: false,
      success: res => {
        console.log("getAutho", res)
        this.setData({
          canGet: false,
        })
      },

    })

  },
  getCardList(callback) {
    let that = this;
    // wx.showLoading({
    //   title: '加载中',
    // })
    // app.showYslLoading(that);
    core.get('sale/cardmessage/cardmessage', {}, function(res) {
      console.log(res);
      // app.hideYslLoading(that);
      console.log(res.data.photo);
      console.log(res.errno);
      if (res.error == 0) {
        console.log('11111');
        that.setData({
          cardList: res.data.photo,
          cardTemplate: res.data.cardTemplate,
          step1: res.step1,
          step2: res.step2,
          shencheng: res.shencheng
        })
      }
      // else if (res.errno == 401) {
      //   wx.showToast({
      //     image: '/static/images/icon_error.png',
      //     title: '请先登录',
      //     mask: true
      //   });
      //   wx.switchTab({
      //     url: 'page/index/index'
      //   })
      // }
    })
  },
  selectCard(e) {
    console.log(e);
    console.log(e.currentTarget);
    var id = e.currentTarget.dataset.id;
    // var videourl = e.currentTarget.dataset.videourl;
    var imgurl = e.currentTarget.dataset.imgurl;
    this.setData({
      ind: id,
      // videourl: videourl,
      imgurl: imgurl
    })
  },
  keyText(e) {
    var value = e.detail.value;
    var counter = this.getLength(value);
    this.setData({
      value: value
    })
    if ((counter > maxLen * 2)) {
      value = this.formatString(value);

      console.log(value)
      counter = maxLen * 2
      wx.showToast({
        title: '刻字长度超出限制',
        icon: 'none'
      });
      this.setData({
        value: value
      })
      return value
    }
  },
  /*获取输入文字长度*/
  getLength(str) {
    var realLength = 0
    var charCode

    for (var i = 0; i < str.length; i++) {
      charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode <= 128) {
        realLength += 1;
      } else {
        realLength += 2;
      }
    }
    return realLength;
  },

  /*获取字符*/
  formatString(str) {
    var result = "",
      str_length = 0,
      strArr = str.split('')
    for (var i = 0, len = str.length; i < len; i++) {
      var charCode = str.charCodeAt(i);
      if (str_length < maxLen * 2) {
        if (charCode >= 0 && charCode <= 128) {
          result += strArr[i];
          str_length += 1;
        } else {
          result += strArr[i];
          str_length += 2;
        }
      }
    }
    return result;
  },
  formSubmit(e) {
    console.log(e);
    var that = this;
    var puzzleId = that.data.ind;
    var sendWord = that.data.value;
    if (!sendWord) {
      wx.showToast({
        title: '请输入寄语',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (puzzleId < 0) {
      wx.showToast({
        title: '请选择拼图',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    // that.setData({
    //   able:true,
    // });
    wx.showLoading({
      title: '生成中...',
    })
    core.get('sale/cardmessage/generate', {
      puzzleId: puzzleId,
      sendWord: sendWord
    }, function(res) {

      wx.hideLoading();
      wx.showToast({
        title: '生成成功',
      });
      console.log(res);
      console.log(that.data.imgurl);
      if (res.status == 1) {
        setTimeout(function() {
          wx.navigateTo({
            url: '/pages/makeCard/makeCard?shareText=' + sendWord + "&videourl=" + that.data.videourl + "&imgurl=" + that.data.imgurl + "&puzzleId=" + puzzleId +'&id='+res.id,
          })
        }, 1000)
      }
      // if (res.errno == 0) {
      //   if (typeof (res.data) == "number") {
      //     wx.showToast({
      //       title: '生成成功',
      //     });
      //     setTimeout(function () {
      //       wx.navigateTo({
      //         url: '/pages/makeCard/makeCard?shareText=' + sendWord + "&videourl=" + that.data.videourl + "&imgurl=" + that.data.imgurl + "&puzzleId=" + puzzleId + "&id=" + res.data,
      //       })
      //     }, 1000)
      //   } else {
      //     that.formSubmit();
      //   }
      // } else {
      //   util.showErrorToast(res.errmsg);
      //   // that.setData({
      //   //   able: false,
      //   // })
      // }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: 'YSL圣罗兰美妆官方商城',
      // imageUrl: '/static/images/allshare.jpg'
    }
  }
})