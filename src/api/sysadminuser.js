import { axios } from '@/utils/request'
import api from './index'

//查询用户
export function queryAdminUser (parameter, page) {
  return axios({
    url: api.sysAdminUser,
    method: 'get',
    params: Object.assign(parameter, page)
  })
}

//创建用户
export function createAdminUser (form) {
  console.log(form)
  return axios({
    url: api.sysAdminUser,
    method: 'post',
    data: form
  })
}

//更新用户
export function updateAdminUser (id, form) {
  return axios({
    url: api.sysAdminUser + "/" + id,
    method: 'put',
    data: form
  })
}

//删除管理员
export function deleteAdminUser (id, form) {
  return axios({
    url: api.sysAdminUser + '/' + id,
    method: 'delete',
  })
}
