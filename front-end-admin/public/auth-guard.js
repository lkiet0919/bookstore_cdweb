;(function () {
  var PUBLIC = [
    '/sign-in',
    '/sign-in-2',
    '/sign-up',
    '/forgot-password',
    '/otp',
    '/401',
    '/403',
    '/404',
    '/500',
    '/503',
  ]

  var path = window.location.pathname.replace(/\/$/, '') || '/'

  if (window.location.search.indexOf('logout=1') !== -1) {
    localStorage.removeItem('admin_access_token')
    try {
      document.cookie =
        'thisisjustarandomstring=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    } catch (e) {
      /* ignore */
    }
  }

  if (PUBLIC.indexOf(path) !== -1) {
    return
  }

  var token = localStorage.getItem('admin_access_token')
  if (!token || !String(token).trim()) {
    var next = encodeURIComponent(
      window.location.pathname + window.location.search
    )
    window.location.replace('/sign-in?redirect=' + next)
  }
})()
