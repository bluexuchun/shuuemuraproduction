# shuuemura
1、/utils/core.js

```
json: function (routes, args, callback, hasloading, ispost, session) {
    let app = getApp(), 
        userinfo_openid = app.getCache('userinfo_openid'),
        usermid = app.getCache('usermid'),
        authkey = app.getCache('authkey'),
        $this = this,
        token = wx.getStorageSync('tokenid'),
        uid = app.getCache('userinfo').id

    args = args || {};
    args.comefrom = 'wxapp';
    args.openid = 'sns_wa_' + userinfo_openid;

    if (usermid) {
        args.mid = usermid.mid;
        args.merchid = args.merchid || usermid.merchid;
    }
    var self = this;
    if (hasloading) {
        self.loading();
    }
    if (args){
        args.authkey = authkey || '';
    }
    var url = ispost ? this.getUrl(routes) : this.getUrl(routes, args);
    var op = {
        url: url + "&timestamp=" + (+new Date()),
        method: ispost ? 'POST' : 'GET',
        header: {
            'Content-type': ispost ? 'application/x-www-form-urlencoded' : 'application/json',
            'token': token ? token : null,
            'uid':uid ? uid : null
        }
    };
    if (!session) {
        delete op.header.Cookie;
    }
    if (ispost) {
        op.data = $.param(args);
    }
    if (callback) {
        console.log(callback)
        op.success = function (res) {
        if (hasloading) {
            self.hideLoading();
        }
        console.log('结果', res.data)
        if (res.errMsg == 'request:ok')
            if (typeof (callback) === 'function') {
            app.setCache('authkey', res.data.authkey || '');
            if (typeof (res.data.sysset) !== 'undefined') {
                if (res.data.sysset.isclose == 1) {
                wx.redirectTo({
                    url: '/pages/message/auth/index?close=1&text=' + res.data.sysset.closetext
                })
                return;
                }
                app.setCache("sysset", res.data.sysset);
            }
            callback(res.data);
            }
        }
    } 
    op.fail = function (res) {
        if (hasloading) {
            self.hideLoading();
        }
        self.alert(res.errMsg);
    }

    wx.request(op);
},

post: function (routes, args, callback, hasloading, session) {
    if(routes == 'wxapp/login' || routes == 'wxapp/auth'){
        this.json(routes, args, callback, hasloading, true, session)
    }else{
        this.getToken(routes, args, callback, hasloading, true, session)
    }
},
get: function (routes, args, callback, hasloading, session) {
    if (routes == 'wxapp/login' || routes == 'wxapp/auth') {
        this.json(routes, args, callback, hasloading, true, session)
    } else {
        this.getToken(routes, args, callback, hasloading, true, session)
    }
},

/**
* 获取最新的token
*/
getToken: function (routes, args, callback, hasloading, session) {
    let app = getApp()
    let uid = app.getCache('userinfo').id
    let openid = app.getCache('userinfo_openid')
    let _this = this
    let config = getApp().getConfig();

    wx.request({
        url: config.api + '&r=wxapp.get_token',
        method:'POST',

        data: {
            uid: uid,
            openid: 'sns_wa_' + openid
        },
        success: function (token_res) {
            if (token_res.data.error == 0) {
                wx.setStorageSync("tokenid", token_res.data.token)
                _this.json(routes, args, callback, hasloading, true, session)
            }
        }
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
                // console.log(res, login_res)
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
                wx.setStorageSync("tokenid",auth_res.token)

                app.setCache('userinfo', res.detail.userInfo, 7200);
                app.setCache('userinfo_openid', res.detail.userInfo.openid);
                app.setCache('userinfo_id', auth_res.id);
                // wx.navigateBack({
                //   delta:2
                // })
                wx.reLaunch({
                    url: '/pages/index/index',
                })
                // wx.reLaunch({
                //   url: '/pages/member/index/index'
                // })
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
    }
},
```
4、/pages/member/index/index.js
```
getInfo: function () {
    var $this = this;
    core.get('member', {}, function (result) {
    console.log(result)
    if (result.isblack == 1) {
        wx.showModal({
        title: '无法访问',
        content: '您在商城的黑名单中，无权访问！',
        success: function (res) {
            if (res.confirm) {
            $this.close()
            }
            if (res.cancel) {
            $this.close()
            }
        }
        })
    }
    if (result.error == 0) {
        $this.setData({
        member: result, show: true, customer: result.customer, customercolor: result.customercolor, phone: result.phone, phonecolor: result.phonecolor, phonenumber: result.phonenumber, iscycelbuy: result.iscycelbuy, bargain: result.bargain
        });
    }
    parser.wxParse('wxParseData', 'html', result.copyright, $this, '5');
    });
},
```

5、/pages/order/index.js
```
get_list: function () {
    var $this = this;
    $this.setData({loading: true});
    core.get('order/get_list', { page: $this.data.page, status: $this.data.status, merchid: 0}, function (list) {
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
            core.toast(list.message, 'loading')
        }
    },$this.data.show);
},

get_updata_list: function () {
    var $this = this;
    $this.setData({ loading: true });
    core.get('order/get_list', { page: 1, status: $this.data.status, merchid: 0}, function (list) {
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
},
```
6、/pages/order/detail/index.js
```
get_list: function () {
    var $this = this;
    core.get('order/detail', 
    { ...$this.data.options}
    , function (list) {
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
},
```
7、/utils/biz/order.js
```
cancel: function (id, index,url) {
    var $this=this,remark = this.cancelArray[index];
    core.post('order/op/cancel', { id: id, remark: remark}, function (data) {
    if (data.error == 0) {
        $this.url(url);
    }
    }, true);
},
```
