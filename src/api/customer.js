import request from '@/utils/request'

export function fetchCustomerExcelList(query) {
  return request({
    url: '/customer/excel/list',
    method: 'get',
    params: query
  })
}

export function importCustomer(data) {
  return request({
    url: '/customer/excel/import',
    method: 'post',
    data
  })
}

export function downloadExcel(id) {
  return request({
    url: '/customer/excel/download',
    responseType: 'blob',
    method: 'get',
    params: { id }
  })
}
