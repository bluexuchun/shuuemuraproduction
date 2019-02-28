function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
// 错误提示
function showErrorToast(msg, iconUrl) {
  let params = {
    title: msg
  }

  if (iconUrl !== 'withoutIcon') {
    params.image = iconUrl || '/static/images/icon_error.png'
  }

  wx.showToast(params)
}
function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}
//获取页面路径及参数
function getRoute(page) {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1]
  const url = currentPage.route
  const options = currentPage.options
  let urlWithArgs = `/${url}?`
  for (let key in options) {
    const value = options[key]
    urlWithArgs += `${key}=${value}&`
  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1).split("?");
  var routeObj = {};
  routeObj.$url_path = urlWithArgs[0].substring(1, urlWithArgs[0].length);
  if (urlWithArgs[1]) {
    routeObj.$url_query = urlWithArgs[1]
  }
  return routeObj
}

module.exports = {
    formatTime,
  getRoute,
  showErrorToast,
}
