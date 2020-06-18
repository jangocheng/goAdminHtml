import { axios } from '@/utils/request'
import api from './index'

export function getUserInfo () {
    return axios({
        url: api.UserInfo,
        method: 'get',
    })
}

export function putUserInfo (params) {
    return axios({
        url: api.UserInfo,
        method: "put",
        data: params
    })
}

export function putUserPassword (params) {
    return axios({
        url: api.UserInfoPassword,
        method: "put",
        data: params
    })
}