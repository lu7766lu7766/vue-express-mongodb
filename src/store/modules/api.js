export default {
  state: {
    isLoading: false,
    loadingAPIs: []
  },
  getters: {
    loadingAPIs: (state) => state.loadingAPIs
  },
  mutations: {
    addLoadingApi(state, api) {
      state.loadingAPIs = _.concat(state.loadingAPIs, [api])
    },
    removeLoadingApi(state, api) {
      state.loadingAPIs = _.filter(state.loadingAPIs, a => a !== api)
    }
  },
  actions: {
    getUsers: async (store) => await apiInit(store, 'get', 'api/users'),
  }
}

async function apiInit({state, commit}, method, url, data = {}, showErrMsg = true) {

  state.isLoading = true
  commit('addLoadingApi', url)
  document.body.style.cursor = "wait"

  var res = await axios( createApiBody(method, url, data))

  state.isLoading = false
  commit("removeLoadingApi", url)
  if(state.loadingAPIs.length === 0) document.body.style.cursor = "auto"

  return res.status === 200  ? multiParse(res.data) : handleError(res, showErrMsg)
}

function multiParse(val) {
  if(_.isObject(val) || _.isArray(val)) {
    _.each(val, (v, k, obj) => {
      obj[k] = multiParse(v)
    })
    return val
  } else {
    try{
      return JSON.parse(val)
    }catch(err) {
      return val
    }
  }
}

function handleError (res, showErrMsg) {

  var msg = res.message

  if(showErrMsg) {
    console.log(`錯誤發生(${msg})`)
  }
}

function createApiBody (method = "get", url = "", data = {}) {
  let res = _.merge({}, {
    url,
    method,
    responseType: 'json',
    withCredentials: true
  })
  res[method == 'get'? 'params': 'data'] = data
  return res
}