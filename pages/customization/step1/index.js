// pages/customization/step1/index.js
var app = getApp(), 
$ = app.requirejs('jquery'), 
core = app.requirejs('core'), 
foxui = app.requirejs('foxui'), 
diyform = app.requirejs('biz/diyform');
var parser = app.requirejs('wxParse/wxParse');
let goodsSn
let goodsId
let goodsDiyPack = {}
let maxLen = 5
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    currentTab: 0,
    // inputValue: '',
    inputValue: { "letter": '', "msg": '' },
    max: 0,
    letterIcon: [{ "id": 0, "code": "0", "url": "../../../static/images/icon_fuhao1.png", "status": false }, { "id": 1, "code": "1", "url": "../../../static/images/icon_fuhao2.png", "status": false }, { "id": 2, "code": "2", "url": "../../../static/images/icon_fuhao3.png", "status": false }, { "id": 3, "code": "3", "url": "../../../static/images/icon_fuhao4.png", "status": false }],
    currentItem: 100,
    isSelect: [false, false, false, false],
    addsymbol: {},
    isUpdate: false,
    cartid: 0,
    alldata:'',
    optionid:"",
    choosekapian:"",
choosefengtao:"",
    haveFengtao:""
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断是否修改
    var that=this;
    that.setData({
      optionid: options.optionid,
      choosekapian: options.choosekapian,
      choosefengtao: options.choosefengtao
    })
    if (options.choosekapian!=""){
      that.setData({
        isUpdate: false,
      })
    }else{
      that.setData({
        isUpdate: true,
      })
    }
    if (options.cartid != undefined) {
      
      this.setData({
        goodsId:options.goodsId,
        isUpdate: true,
        cartid: options.cartid
      },function(){
        that.getGallery(options.goodsId);
        that.getUpdate(options.cartid)
      })
    }
    else {
      this.setData({
        goodsId:options.goodsId,
        haveFengtao:options.haveFengtao
      })
      goodsSn = options.goodsSn
      goodsId = options.goodsId
      console.log(goodsId);
      this.getGallery(goodsId)
    }
    console.log(this.data.inputValue.letter)
  },

  getGallery(id) {
    var $this=this;
    console.log(id)
    let that = this
    core.get('goods/get_letting', { 'id': id }, function(res){
      console.log(res)
      var olddata=res.info;
      // console.log(olddata[0].locate)
      var dvcwidth = wx.getSystemInfoSync().windowWidth;
      var dvcheight = wx.getSystemInfoSync().windowHeight;
      console.log(dvcheight,dvcwidth);
      for (var i = 0; i < olddata.length; i++) {
        console.log(olddata[i].locate[0]);
        var left = olddata[i].locate[0].left;
        olddata[i].locate[0].left = left / 200 * 100 + 13;
        // olddata[i].locate[0].left = (400 * ratior * left / 200 + 30) * ratio;
        var top = olddata[i].locate[0].top;
        olddata[i].locate[0].top = top / 200 * 100 + 12.5;
        // olddata[i].locate[0].top = (400 * ratior * top / 200 + 26) * ratio;
      }
      console.log(olddata);
        
        // let imgInfo = res.data

        // imgInfo.forEach((item) => {
        //   let obj = {}
        //   let tempArr = item.img_desc ? item.img_desc.replace('{', '').replace('}', '').split(',') : [];

        //   tempArr.forEach((arr) => {
        //     let temp = arr.split(':')
        //     obj[temp[0]] = temp[1]
        //   })

        //   item.img_desc = obj
        // })
      parser.wxParse('wxParseData', 'html', res.letting.intro.letterinstr, $this, '0');
        that.setData({
          // imgUrls: imgInfo,
          
          max: res.info.length - 1,
          kezipic: olddata,
          keziprice:res.letting.intro.sercharge,
          alldata:res.letting.intro
        })
        // console.log(that.data.inputValue)
    })
  },

  prevSwiper(e) {
    this.setData({
      currentTab: this.data.currentTab != 0 ? this.data.currentTab - 1 : this.data.max
    });
  },

  nextSwiper(e) {
    this.setData({
      currentTab: this.data.currentTab < this.data.max ? this.data.currentTab + 1 : 0
    })
  },

  bindKeyInput(e) {
    let iptId = e.currentTarget.id;
    // var reg = /^[\u0391-\uFFE5A-Za-z]+$/;
    var reg = /^[A-Za-z\u4e00-\u9fa5]+$/gi;
    // var reg = new RegExp("^[A-Za-z\u4e00-\u9fa5]+$");
    if (iptId === 'letter') {

      let counter = this.getLength(e.detail.value)

      let value = e.detail.value;
      let sign = reg.test(value);
      console.log(value, reg.test(value))
      if (!sign) {
        value = value.substring(0, value.length - 1);
        wx.showToast({
          title: '刻字不符合要求',
          icon: 'none'
        })
      }
      if ((counter > maxLen * 2)) {
        value = this.formatString(value);

        console.log(value)
        counter = maxLen * 2
        wx.showToast({
          title: '刻字长度超出限制',
          icon: 'none'
        })
      }
      this.setData({
        ['inputValue.' + iptId]: value
      })
      return value
    }
    else {
      this.setData({
        ['inputValue.' + iptId]: e.detail.value
      })
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
      }
      else {
        realLength += 2;
      }
    }
    return realLength;
  },

  /*获取字符*/
  formatString(str) {
    var result = "", str_length = 0, strArr = str.split('')
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

  getUpdate(cid) {
    var data='';
    console.log('111');
    let that = this
    core.get('member/cart/get_cart',{}, function(res){
      var list=res.list;
      for(let i=0;i<list.length;i++){
        if(list[i].id==cid){
          data=list[i];
        }
      }


      
      console.log(res);
      // let _data = res.data.cartVo
      let imgcode = data.customized_data.jieduanyi.imgcode != undefined ? data.customized_data.jieduanyi.imgcode : ''
      let desc = data.customized_data.jieduanyi.desc != undefined ? data.customized_data.jieduanyi.desc : ''
      let ms = data.customized_data.remark
      if (ms == "{}") {
        ms = '';
      }


      that.data.letterIcon.forEach((item => {
        if (item.code === imgcode) {
          that.setData({
            currentItem: item.id,
            ["isSelect[" + item.id + "]"]: true,
          })
        }
      }))
      that.setData({
        ['inputValue.letter']: desc,
        ['inputValue.msg']: ms,
      })

      // that.getGallery(_data.goods_id)
    })
  },

  nextStep() {
    var that=this;
    if (this.data.inputValue.letter == '') {
      wx.showModal({
        title: '提示',
        content: '请输入您的刻字内容',
        showCancel: false
      })
      return false
    }
    else {
      let idx = this.data.currentItem
      console.log(this.data.keziprice);
      goodsDiyPack.imgcode = this.data.isSelect[idx] ? this.data.letterIcon[idx].code : ''
      goodsDiyPack.desc = this.data.inputValue.letter;
      goodsDiyPack.keziprice=this.data.keziprice;

      
    console.log(goodsDiyPack);
      wx.navigateTo({
        url: '../step2/index?goodsDiyPack=' + JSON.stringify(goodsDiyPack) + '&goodsSn=' + goodsSn + '&goodsId=' + goodsId + '&remark=' + this.data.inputValue.msg + '&haveFengtao=' + that.data.haveFengtao + "&optionid=" + that.data.optionid,
      })
    }
  },

  // 切换符号
  switchIcon(e) {
    let _id = e.currentTarget.dataset.id
    this.setData({
      isSelect: [false, false, false, false],
      ["isSelect[" + _id + "]"]: !this.data.isSelect[_id],
      currentItem: _id,
      addsymbol: this.data.letterIcon[_id]
    })

    console.log(this.data.isSelect)
  },

  changeSwiper(e) {
    this.setData({
      currentTab: e.detail.current
    })
  },

  jumpStep() {
    var that=this;
    let idx = this.data.currentItem
    goodsDiyPack.imgcode = this.data.isSelect[idx] ? this.data.letterIcon[idx].code : '';
    goodsDiyPack.desc = '';
    goodsDiyPack.kezipic=0;
    if(this.data.inputValue.letter){
      console.log('111');
    }else{
      console.log(222);
    }
    goodsDiyPack.orjieduanyi="1";
    console.log(goodsDiyPack);

    wx.navigateTo({
      url: '../step2/index?goodsDiyPack=' + JSON.stringify(goodsDiyPack) + '&goodsSn=' + this.data.goodsSn + '&goodsId=' + goodsId + '&remark=' + ''+ '&haveFengtao=' + that.data.haveFengtao + "&optionid=" + that.data.optionid,
    })
  },

  // sendMsg(){
  //   if (this.data.inputValue.msg==''){
  //     wx.showToast({
  //       title: '请输入您的留言内容',
  //       icon: 'none'
  //     })
  //   }
  //   else{
  //     wx.showToast({
  //       title: '提交留言成功',
  //       icon: 'none'
  //     })
  //   }
  // },

  cancel() {
    wx.navigateBack({
      delta: 1
    })
  },

  saveData() {
    if (this.data.inputValue.letter == '') {
      wx.showModal({
        title: '提示',
        content: '请输入您的刻字内容',
        showCancel: false
      })
      return false
    }
    let idx = this.data.currentItem
    goodsDiyPack.imgcode = this.data.isSelect[idx] ? this.data.letterIcon[idx].code : ''
    goodsDiyPack.desc = this.data.inputValue.letter
    console.log(this.data.inputValue.letter);
    if (goodsDiyPack.desc==''){
      goodsDiyPack.kezipic=0;
    }
    console.log(goodsDiyPack);
    let that = this
    core.get('member/cart/add', {
      id:that.data.goodsId,
      cid: that.data.cartid,
      optionid: that.data.optionid,
      jieduanyi: JSON.stringify(goodsDiyPack),
      remark: that.data.inputValue.msg
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