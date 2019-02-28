// pages/friendPuzzle/friendPuzzle.js
var app = getApp(), $ = app.requirejs('jquery'), core = app.requirejs('core'), foxui = app.requirejs('foxui'), diyform = app.requirejs('biz/diyform');
Page({

  /**
   * 页面的初始数据
   */
  data: {
      info:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var that = this
    this.setData({
      id: options.id
    },function(){
      that.getInfo(options.id)
    })
    // setTimeout(function () {
    //   wx.navigateTo({
    //     url: '/pages/finishPuzzle/finishPuzzle?nickName=' + that.data.info.nickName + "&sendWord=" + that.data.info.sendWord + "&videoUrl=" + that.data.info.puzzleVo.videoUrl,
    //   })
    // }, 2000)
  },
  scan(){
    var urls = [];
    var that = this;
    urls.push(that.data.info.photo)
    wx.previewImage({
      urls: urls,
      current: that.data.info.photo
    })
  },
  getInfo(id){
    var that = this;
    // wx.showLoading({
    //   title: '加载中',
    // });
    // var randomNumber = 0;
    var finalNumber = 9;
    core.get('sale/cardmessage/refule', { id: id }, function(res){
      wx.hideLoading();
    //   // setTimeout(function () {
    //   //   wx.redirectTo({
    //   //     url: '/pages/finishPuzzle/finishPuzzle?nickName=' + that.data.info.nickName + "&sendWord=" + that.data.info.sendWord + "&videoUrl=" + that.data.info.puzzleVo.videoUrl,
    //   //   })
    //   // }, 1000)
      console.log(res);
      if (res.error == 0) {
        var puzzleVoList = res.data.puzzleVoList;
        for (var i = 0; i < puzzleVoList.length * 2; i++) {
          var randomNumber = Math.floor(Math.random() * finalNumber);
          var randomNumber1 = Math.floor(Math.random() * finalNumber);
          var ite = puzzleVoList[randomNumber];
          var ite1 = puzzleVoList[randomNumber1];
          puzzleVoList[randomNumber] = ite1;
          puzzleVoList[randomNumber1] = ite;
        }
        puzzleVoList.forEach((item, index) => {
          item.selected = false;
          item.current = index + 1;
        })
        console.log(puzzleVoList);
        that.setData({
          christmasCardList: puzzleVoList,
          info: res.data,
        })
      } else {
        // util.showErrorToast(res.errmsg);
        // that.setData({
        //   able: false,
        // })
      }
    })
  },
  //九宫格拼图
  puzzle(e) {
    var christmasCardList = this.data.christmasCardList;
    var sortOrder = e.currentTarget.dataset.sortid;
    var current = e.currentTarget.dataset.current;
    var that = this;
    var selectedNumber = 0;
    var ele1, ele2;
    var index1, index2, selectItem;
    console.log("current=" + current, "sortOrder=" + sortOrder);
    christmasCardList.forEach((item, index) => {
      if (item.selected) {
        selectedNumber++;
        selectItem = item;
      }
    })
    //选中效果
    console.log(selectedNumber)
    if (selectedNumber == 1) {
      var curr = selectItem.current;
      console.log(curr);
      var selArr = [{ current: 1, canSelected: "124" }, { current: 2, canSelected: "1235" }, { current: 3, canSelected: "236" }, { current: 4, canSelected: "1457" }, { current: 5, canSelected: "24568" }, { current: 6, canSelected: "3569" }, { current: 7, canSelected: "478" }, { current: 8, canSelected: "5789" }, { current: 9, canSelected: "689" }];
      selArr.forEach((item, index) => {
        if (item.current == current) {
          if (item.canSelected.indexOf(selectItem.current) >= 0) {
            for (var i = 0; i < christmasCardList.length; i++) {
              if (sortOrder == christmasCardList[i].sortOrder) {
                christmasCardList[i].selected = !christmasCardList[i].selected;
                that.setData({
                  christmasCardList: christmasCardList
                })
                break;
              }
            }
          }
        }
      })
    } else {
      for (var i = 0; i < christmasCardList.length; i++) {
        if (sortOrder == christmasCardList[i].sortOrder) {
          christmasCardList[i].selected = !christmasCardList[i].selected;
          console.log(111111)
          that.setData({
            christmasCardList: christmasCardList
          })
          break;
        }
      }
    }
    selectedNumber = 0;
    christmasCardList.forEach((item, index) => {
      if (item.selected) {
        selectedNumber++;
      }
    })
    //选中两个拼图时交换位置
    if (selectedNumber == 2) {
      christmasCardList.forEach((item, index) => {
        if (item.selected) {
          ele1 ? ele2 = item : ele1 = item;
          (index1 || index1 == 0) ? index2 = index : index1 = index;
          item.selected = false;
          console.log("index=" + index)
        }
      })
      christmasCardList[index1] = ele2;
      christmasCardList[index2] = ele1;
      christmasCardList[index1].current = index1 + 1;
      christmasCardList[index2].current = index2 + 1;
      console.log(index1, index2, christmasCardList)
      that.setData({
        christmasCardList: christmasCardList
      })
      //判断拼图完成
      var finished = true;
      christmasCardList.forEach((item, index) => {
        if (item.sortOrder != item.current) {
          finished = false
        }
      })
      if (finished) {
        wx.showToast({
          title: '拼图完成',
        });
        setTimeout(function () {
          wx.redirectTo({
            url: '/pages/finishPuzzle/finishPuzzle?nickName=' + that.data.info.openid + "&sendWord=" + that.data.info.sendWord,
          })
        }, 2000)
      }
    }
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