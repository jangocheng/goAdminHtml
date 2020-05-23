import Vue from 'vue'
import axios from 'axios'
import store from '@/store'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN } from '@/store/mutation-types'

// 创建 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL, // api base_url
  timeout: 6000 // 请求超时时间
})

const err = (error) => {
  if (error.response) {
    const data = error.response.data
    const token = Vue.ls.get(ACCESS_TOKEN)
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
      if (token) {
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        })
      }
    }
  }
  return Promise.reject(error)
}

// request interceptor
service.interceptors.request.use(config => {
  const token = Vue.ls.get(ACCESS_TOKEN)
  if (token) {
    config.headers['token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
  }
  if (!config.data) {
    config.data = JSON.stringify(config.data)
  }
  return config
}, err)

// response interceptor 相应拦截器
service.interceptors.response.use((response) => {
  var token = response.headers["token"]
  if (token != undefined) {
    Vue.ls.set(ACCESS_TOKEN, token)
    store.commit('SET_TOKEN', token)
  }
  // const token = Vue.ls.get(ACCESS_TOKEN)
  if (response.data && response.data.code === 403) {
    notification.error({
      message: '未授权',
      description: data.message
    })
    return {}
  }
  if (response.data && response.data.code === 401) {
    notification.error({
      message: '未认证',
      description: 'Authorization verification failed'
    })
    
    store.dispatch('Logout').then(() => {
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    })
    return {}
    
  }

  if (token == "") {
    store.dispatch('Logout').then(() => {
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    })
    return {}
  }

  if(response.data && response.data.code===404){
    notification.error({
      message: '无效请求',
      description: '该请求地址不存在'
    })
    return {}
  }
  // console.log(response,'22')
  return response.data
}, err)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, service)
  }
}

export {
  installer as VueAxios,
  service as axios
}
