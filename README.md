# shuuemura
1、/utils/core.js

```
/**
* 添加方法getToken
**/
getToken: function (page) {
    this.get('auth/get_token', {
        sessionid: wx.getStorageSync("sessionid")
    }, function (data) {
        console.log(data)
        wx.setStorageSync("tokenId", data.token)
    })
}
```

2、/pages/message/auth/index.js
```
// 点击open-type="getUserInfo"时候的回调函数
bindGetUserInfo: function (res) {
    wx.login({
        success: function (ret) {
            // console.log(ret)
            core.post('wxapp/login', { code: ret.code }, function (login_res) {
                if (login_res.error) {
                    core.alert('获取用户登录态失败:' + login_res.message);
                    return;
                }
                core.get('wxapp/auth', {
                data: res.detail.encryptedData,
                    iv: res.detail.iv,
                    sessionKey: login_res.session_key
                }, function (auth_res) {
                    if (auth_res.isblack == 1) {
                        wx.showModal({
                        title: '无法访问',
                        content: '您在商城的黑名单中，无权访问！',
                        success: function (res) {
                            if (res.confirm) {
                            app.close();
                            }
                            if (res.cancel) {
                            app.close();
                            }
                        }
                        })
                    }
                    res.detail.userInfo.openid = auth_res.openId
                    res.detail.userInfo.id = auth_res.id
                    res.detail.userInfo.uniacid = auth_res.uniacid
                    wx.setStorageSync("sessionid",auth_res.sessionid)
                    // 这一块需要新添加
                    core.getToken(this)

                    app.setCache('userinfo', res.detail.userInfo, 7200);
                    app.setCache('userinfo_openid', res.detail.userInfo.openid);
                    app.setCache('userinfo_id', auth_res.id);
                    wx.reLaunch({
                        url: '/pages/index/index',
                    })
                })
            })
        },
        fail: function () {
            core.alert('获取用户信息失败!');
        }
    })
}
```
3、app.js
```
// 授权登陆的检查 这个方法需重新替换
checkAuth: function () {
    let that = this
    var url = '/pages/message/auth/index'
    
    var userinfo = this.getCache('userinfo')
    if(!userinfo) {
        wx.navigateTo({
            url: url
        })
    }else{
        wx.getSetting({
            success: function (settings) {
                if (!settings.authSetting['scope.userInfo']) {
                    wx.navigateTo({
                    url: url
                    })
                }
            }
        })
    }
},
```
4、/pages/member/index/index.js
```
getInfo: function(){
    var $this = this;
    core.get('auth/get_token', {
        sessionid: wx.getStorageSync("sessionid")
    }, function (data) {
        wx.setStorageSync("tokenId", data.token)
        let useropenid = wx.getStorageSync('tokenId') + app.getCache('userinfo_openid')
        core.get('member', {sessionid: wx.getStorageSync('sessionid'), token: useropenid}, function(result){
        if (result.isblack == 1){
            wx.showModal({
                title: '无法访问',
                content: '您在商城的黑名单中，无权访问！',
                success: function (res) {
                    if (res.confirm) {
                        $this.close()
                    }
                    if (res.cancel){
                        $this.close()
                    }
                }
            })
        }
        if(result.error!=0){
            wx.clearStorage()
            wx.redirectTo({
                url: '/pages/message/auth/index'
            })
        }else{
            $this.setData({
                member: result, show: true, customer: result.customer, customercolor: result.customercolor, phone: result.phone, phonecolor: result.phonecolor, phonenumber: result.phonenumber, iscycelbuy: result.iscycelbuy,bargain:result.bargain
            });
        }
        parser.wxParse('wxParseData','html', result.copyright,$this,'5');
    });
    })
},
```
5、/pages/order/index.js
```
get_list: function () {
    var $this = this;
    $this.setData({loading: true});
    core.get('auth/get_token', {
        sessionid: wx.getStorageSync("sessionid")
    }, function (data) {
        wx.setStorageSync("tokenId", data.token)
        let useropenid = wx.getStorageSync('tokenId') + app.getCache('userinfo_openid')
        core.get('order/get_list', { page: $this.data.page, status: $this.data.status, merchid: 0, sessionid: wx.getStorageSync('sessionid'), token: useropenid}, function (list) {
            console.log(list);
            if (list.error == '-7') {
                core.toast(list.message, 'none');
                wx.clearStorage()
                setTimeout(() => {
                wx.redirectTo({
                    url: '/pages/message/auth/index'
                })
                }, 1000)
            }
            if (list.error==0){
                list.list.map((v,i) =>{
                    v.price = parseInt(v.price)
                })
                $this.setData({loading:false,show:true,total:list.total,empty:true});
                if(list.list.length>0){
                    $this.setData({
                        page: $this.data.page+1,
                        list: $this.data.list.concat(list.list)
                    });
                }
                if(list.list.length<list.pagesize) {
                    $this.setData({
                        loaded: true
                    });
                }
            }else{
                core.toast(list.message,'loading')
            }
        },$this.data.show);
    })
},
get_updata_list: function () {
    var $this = this;
    $this.setData({ loading: true });
    core.get('auth/get_token', {
        sessionid: wx.getStorageSync("sessionid")
    }, function (data) {
        wx.setStorageSync("tokenId", data.token)
        let useropenid = wx.getStorageSync('tokenId') + app.getCache('userinfo_openid')
        core.get('order/get_list', { page: 1, status: $this.data.status, merchid: 0, sessionid: wx.getStorageSync('sessionid'), token: useropenid}, function (list) {
            console.log(list);
            if (list.error == 0) {
            $this.setData({ loading: false, show: true, total: list.total, empty: true });
                if (list.list.length > 0) {
                    $this.setData({
                        list: list.list
                    });
                }
            }
        });
    })
},
```
6、/pages/order/detail/index.js
```
get_list: function () {
    var $this = this;
    core.get('auth/get_token', {
        sessionid: wx.getStorageSync("sessionid")
    }, function (data) {
        wx.setStorageSync("tokenId", data.token)
        let useropenid = wx.getStorageSync('tokenId') + app.getCache('userinfo_openid')
        core.get('order/detail', 
        { ...$this.data.options, sessionid: wx.getStorageSync("sessionid"), token: useropenid}
        , function (list) {
        if(list.error == '-7'){
            core.toast(list.message, 'none');
            wx.clearStorage()
            setTimeout(() => {
                wx.redirectTo({
                url: '/pages/message/auth/index'
                })
            },1000)
        }
        if (list.error>0){
            if (list.error != 50000) {
            core.toast(list.message, 'loading');
            }
        }
            if(list.nogift[0].fullbackgoods != undefined ){
            var fullbackratio = list.nogift[0].fullbackgoods.fullbackratio;
            var maxallfullbackallratio = list.nogift[0].fullbackgoods.maxallfullbackallratio;
            var fullbackratio = Math.round(fullbackratio);
            var maxallfullbackallratio = Math.round(maxallfullbackallratio);
            }
    
            if (list.error==0){
                $this.setData({
                getOrder: JSON.stringify(list),
                lists: list
                })
                list.show = true;
                var ordervirtualtype = Array.isArray(list.ordervirtual);
                list.goods.map((v,i) => {
                v.price = parseInt(v.price)
                })
                list.order.price = parseInt(list.order.price)
                list.order.goodsprice = parseInt(list.order.goodsprice)
                $this.setData(list);
                $this.setData({
                ordervirtualtype: ordervirtualtype, fullbackgoods: list.nogift[0].fullbackgoods, maxallfullbackallratio: maxallfullbackallratio, fullbackratio: fullbackratio, invoice: list.order.invoicename, membercard_info: list.membercard_info ,
                
                })
                if(list.sercharge){
                $this.setData({
                    sercharge:list.sercharge
                })
                }
            }
        })
    });
},
```
7、/utils/biz/order.js
```
cancel: function (id, index,url) {
    var $this=this,remark = this.cancelArray[index];
    core.get('auth/get_token', {
        sessionid: wx.getStorageSync("sessionid")
    }, function (data) {
        wx.setStorageSync("tokenId", data.token)
        let useropenid = wx.getStorageSync('tokenId') + app.getCache('userinfo_openid')
        core.post('order/op/cancel', { id: id, remark: remark, sessionid: wx.getStorageSync("sessionid"), token: useropenid }, function (data) {
            if (data.error == 0) {
                $this.url(url);
            }
        }, true);
    }) 
},
```
