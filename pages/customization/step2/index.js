// pages/customization/step2/index.js
var app = getApp(),
  $ = app.requirejs('jquery'),
  core = app.requirejs('core'),
  foxui = app.requirejs('foxui'),
  diyform = app.requirejs('biz/diyform');
let goodsInfo = {}
let goodsDiyCard = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cards: [
      {
        id: 1, backPicUrl:    'https://yslvday.blob.core.chinacloudapi.cn/yslvday/%E5%8D%A1%E7%89%87%E5%AE%9A%E5%88%B6-%E9%A2%84%E8%A7%88.jpg',
        name: 'YSL白底卡片',
        mainPicUrl:'https://yslvday.blob.core.chinacloudapi.cn/yslvday/%E5%8D%A1%E7%89%87%E5%AE%9A%E5%88%B6-%E9%A2%84%E8%A7%88.jpg'
      },
      {
        id:2, backPicUrl: 'https://yslvday.blob.core.chinacloudapi.cn/yslvday/圣诞活动/小程序圣诞活动图1018/折横（正面）%20黑色卡片800-600-1.jpg',
        name: 'YSL黑底卡片',
        mainPicUrl: 'https://yslvday.blob.core.chinacloudapi.cn/yslvday/圣诞活动/小程序圣诞活动图1018/折横（正面）%20黑色卡片800-600-1.jpg'
      },
    ],
    isFlip: [],
    currentCard: 1,
    inputValue: '',
    isUpdate: false,
    cartid: 0,
    orjieduanyi:'',
    notice:"",
    optionid:"",
    haveFengtao:"",
    goodsId:"",
    currentimg:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var haveFengtao='';
    console.log("goodsInfo", goodsInfo, goodsDiyCard)
    if(options.haveFengtao){

      haveFengtao=options.haveFengtao;
    }
    var that=this;
    that.setData({
      optionid: options.optionid,
      goodsId: options.goodsId,
      haveFengtao: options.haveFengtao,
      linshiguige: wx.getStorageSync("linshiguige")
    })
    if (options.haveFengtao!=""){
      that.setData({
        isUpdate:false
      })
    }else{
      that.setData({
        isUpdate: true
      })
    }
    // wx.getStorageSync("linshiguige")
    // wx.getStorage({
    //   key: 'linshiguige',
    //   success: function (res) {
    //     console.log(res.data)
       

    //   }
    // })
    // this.getCard()
    // 判断是否修改
    if (options.cartid != undefined) {

      console.log('2222');
      
      this.setData({
        goodsId:options.goodsId,
        isUpdate: true,
        cartid: options.cartid
      },function(){
        that.getUpdate(options.cartid)
      })
    }
    else {
      if(options.goodsDiyPack){
        goodsInfo.goodsDiyPack = JSON.parse(options.goodsDiyPack)
      }
      if(options.orjieduanyi){
        this.setData({
          orjieduanyi:'1'
        })
      }
     
      
      goodsInfo.goodsSn = options.goodsSn
      goodsInfo.goodsId = options.goodsId
      goodsInfo.remark = options.remark
    }
    if (options.firstStep) {
      goodsInfo.goodsDiyPack = JSON.parse(options.firstStep)
      console.log('goodsinfos', goodsInfo)
    }
    if (options.sendStep) {
      goodsDiyCard = JSON.parse(options.sendStep)
      console.log('goodsinfos', goodsDiyCard)
    }
    this.setData({
      
      id: goodsInfo.goodsId ? goodsInfo.goodsId : options.goodsId,
      haveFengtao:haveFengtao
    })
    this.getCard()
    console.log(goodsInfo)

    
    console.log(goodsInfo.goodsDiyPack);
  },

  getCard() {
    var $this=this;
    console.log($this.data.id);
    core.get('goods/get_card', { id: $this.data.id}, function(res){
      console.log(res, 'dddddd', $this.data.id,"goods/get_card");
      $this.setData({
        cards:res.card,
        currentCard:res.card[0].id,
        morencardid:res.card[0].id,
        currentimg:res.card[0].img,
        notice: res.card[0].notice
      })
    })
  },

  getUpdate(cid) {
    var data = '';
    let that = this
    core.get('member/cart/get_cart',{}, function(res){
      console.log(res)
      var list = res.list;
      for (let i = 0; i < list.length; i++) {
        if (list[i].id == cid) {
          data = list[i];
        }
      }
      let id = data.customized_data.jieduaner.id != undefined ? data.customized_data.jieduaner.id : ''
      let desc = data.customized_data.jieduaner.desc != undefined ? data.customized_data.jieduaner.desc : ''
      goodsDiyCard.url = that.data.currentimg;
      that.data.cards.forEach((item) => {
        if (item.id === id) {
          console.log("currentimg", item.img)
          that.setData({
            currentCard: item.id,
            currentimg: item.img
          })
        }
      })
      console.log('goodsDiyCard', goodsDiyCard, that.data.currentimg)
      that.setData({
        inputValue: desc,
      })
    })
  },
  /*获取输入文字长度*/
  getLength(str) {
    var realLength = 0
    var charCode

    for (var i = 0; i < str.length; i++) {
      charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode <= 128) {
        realLength += 1;
      }
      else {
        realLength += 2;
      }
    }
    return realLength;
  },
  bindKeyInput(e) {
    var reg = /^[\u0391-\uFFE5A-Za-z]+$/;
    var value = e.detail.value
    // console.log(reg.test(value), this.getLength(value))
    this.setData({
      inputValue: e.detail.value
    })
  },

  flipCard(e) {
    let _id = e.currentTarget.dataset.id;
    let currentimg=e.currentTarget.dataset.url;
    let notice = e.currentTarget.dataset.notice;
    console.log(_id);
    this.setData({
      currentCard: _id,
      currentimg: currentimg,
      notice,
    })
  },

  nextStep() {
    console.log(this.data.currentCard);
    console.log(goodsInfo)
    console.log(this.data.inputValue)
    if (this.data.currentCard != 0) {
      if ((this.data.inputValue.trim() == '') && (this.data.currentCard != 6)) {
        wx.showModal({
          title: '提示',
          content: '请输入您的寄语',
          showCancel: false
        })
        return false
      }
      else {
        // 卡片信息
        this.data.cards.forEach((item) => {
          if (item.id === this.data.currentCard) {
            goodsDiyCard.sku = item.sku
          }
        })
        goodsDiyCard.desc = this.data.inputValue
        this.addCart()
        // 跳转到第三部
      //   console.log(goodsInfo);
      //   goodsDiyCard.id = this.data.currentCard;
      //   goodsDiyCard.url = this.data.currentimg;
      //   console.log(goodsDiyCard);
      //   var guige = '';
      //   var obj = {};
      //   obj = {
      //     id: goodsInfo.goodsId,
      //     total: 1,
      //     optionsid: this.data.optionid,
      //   }
      //   let sendStep = JSON.stringify(goodsDiyCard);
      //   let firstStep = JSON.stringify(goodsInfo.goodsDiyPack);
      //    let newSends = {
      //      remark: goodsInfo.remark,
      //      orjieduanyi: this.data.orjieduanyi,
      //      notice: this.data.notice
      //    };
      //   let end = JSON.stringify(newSends)

        
      //   wx.navigateTo({
      //     url: '../step3/step3?cartId=' + res.id + '&id=' + that.data.id + "&optionid=" + that.data.optionid + '&sendStep=' + sendStep + "&firstStep=" + firstStep+"&end="+end,
      //   })
      }
    }
    else {
      wx.showModal({
        title: '提示',
        content: '请选择定制卡片',
        showCancel: false
      })
      return false
    }
  },

  addCart() {
    let that = this
    let num = 0
    let addFlag = true
    that.add()
    // util.request(api.CartList, {}, 'POST').then(function (res) {
      // if (res.errno === 0) {
    // that.add()
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
      // } else {
      //   util.showErrorToast('添加购物车失败');
      // }
    // })
  },

  add() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })

    console.log(goodsInfo);
    goodsDiyCard.id = this.data.currentCard;
    goodsDiyCard.url=this.data.currentimg;
    console.log(goodsDiyCard);
    var guige='';
    var obj={};
        obj = {
          id: goodsInfo.goodsId,
          total: 1,
          optionsid: this.data.optionid,
        }

      
    
    console.log(this.data.orjieduanyi, 'gggg', goodsInfo.goodsId, this.data.linshiguige[0].id, goodsDiyCard, goodsInfo.goodsDiyPack, goodsInfo.remark, this.data.orjieduanyi, this.data.notice);
    core.get('member/cart/add', 
    {
       id: goodsInfo.goodsId, 
        optionid: that.data.optionid, 
        total: 1,
        jieduaner:goodsDiyCard,
        jieduanyi:goodsInfo.goodsDiyPack,
        remark:goodsInfo.remark,
        orjieduanyi:that.data.orjieduanyi,
        notice:that.data.notice
    }, function(res){
      let sendStep = JSON.stringify(goodsDiyCard);
      let firstStep = JSON.stringify(goodsInfo.goodsDiyPack);
      let newSends = {
        remark: goodsInfo.remark,
        orjieduanyi: that.data.orjieduanyi,
        notice: that.data.notice
      };
      let end = JSON.stringify(newSends)
      wx.hideLoading();
      console.log(res);
      //  app.sensors.track('SubmitToCart', {
      //     product_id: goodsInfo.goodsSn,
      //     submit_type: "customization",
      //   });
 
          console.log(that.data.haveFengtao);
          if(that.data.haveFengtao==''){
            wx.switchTab({
              url: '/pages/member/cart/index',
            })
          }else{
            wx.navigateTo({
              url: '../step3/step3?cartId=' + res.id + '&id=' + that.data.id + "&optionid=" + that.data.optionid + '&sendStep=' + sendStep + "&firstStep=" + firstStep + "&end=" + end,
            })
            // wx.navigateTo({
            //   url: '../step3/step3?cartId='+res.id+'&id='+that.data.id+"&optionid="+that.data.optionid,
            // })
          }
      
    })
  },


  add1() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })

    console.log(goodsInfo);
    goodsDiyCard.id = '';
    goodsDiyCard.url = '';
    console.log(goodsDiyCard);
    var guige = '';
    var obj = {};
    obj = {
      id: goodsInfo.goodsId,
      total: 1,
      optionsid: this.data.linshiguige[0].id,
    }
    // console.log(goodsInfo.goodsDiyPack.desc);

    // if (goodsInfo.goodsDiyPack.desc!=''){
    //   goodsInfo.goodsDiyPack.keziprice=80;
    // }
    console.log(that.data.orjieduanyi);
    core.get('member/cart/add',
     { 
              id: goodsInfo.goodsId,
              optionid: that.data.optionid,
              total: 1,
              jieduaner: goodsDiyCard, 
              jieduanyi: goodsInfo.goodsDiyPack,
              remark: goodsInfo.remark, 
              orjieduanyi: that.data.orjieduanyi 
         }, function (res) {
      //  app.sensors.track('SubmitToCart', {
      //   product_id: goodsInfo.goodsSn,
      //   submit_type: "customization",
      //    goods_name:""
      // });
      wx.hideLoading();
      console.log(res);
       let sendStep = JSON.stringify(goodsDiyCard);
       let firstStep = JSON.stringify(goodsInfo.goodsDiyPack);
       let newSends = {
         remark: goodsInfo.remark,
         orjieduanyi: that.data.orjieduanyi,
         notice: that.data.notice
       };
       let end = JSON.stringify(newSends)
      console.log(that.data.haveFengtao);
      if (that.data.haveFengtao == '') {
        wx.switchTab({
          url: '/pages/member/cart/index',
        })
      } else {
        wx.navigateTo({
          url: '../step3/step3?cartId=' + res.id + '&id=' + that.data.id + "&optionid=" + that.data.optionid + '&sendStep=' + sendStep + "&firstStep=" + firstStep + "&end=" + end,
        })
       
      }
      
    })
  },

  jumpStep() {
    this.add1()

  },

  cancel() {
    wx.navigateBack({
      delta: 1
    })
  },

  saveData() {
    //判断是否有第三部
    if ((this.data.inputValue.trim() == '') && (this.data.currentCard != 6)) {
      wx.showModal({
        title: '提示',
        content: '请输入您的寄语',
        showCancel: false
      })
      return false
    }
    this.data.cards.forEach((item) => {
      if (item.id === this.data.currentCard) {
        goodsDiyCard.id = item.id
      }
    })
    goodsDiyCard.desc = this.data.inputValue;
    goodsDiyCard.url=this.data.currentimg;
    console.log(goodsDiyCard);
    // goodsDiyCard.sku = this.data.inputValue;

    let that = this
    core.get('member/cart/add', {
      id:that.data.goodsId,
      cid: that.data.cartid,
      jieduaner: JSON.stringify(goodsDiyCard),
      jieduanyi: JSON.stringify(goodsInfo.goodsDiyPack),
      remark: goodsInfo.remark, 
      optionid:that.data.optionid
    }, function(res){
      wx.showToast({
        icon: 'success',
        title: '保存成功',
        success: function () {
          wx.switchTab({
            url: '../../member/cart/index',
          })
        }
      })
    })
  },
  onShareAppMessage: function () {
    return {
      title: 'YSL圣罗兰美妆官方商城',
      imageUrl: '/static/images/share.jpg'
    }
  }
})