import apiClient from './axiosClient'

const RESOURCE = '/settings'

export const getSettings = () => apiClient.get(RESOURCE)
export const getSettingByKey = (key) => apiClient.get(`${RESOURCE}/${encodeURIComponent(key)}`)
export const createOrUpdateSetting = (payload) => apiClient.post(RESOURCE, payload)

export default { getSettings, getSettingByKey, createOrUpdateSetting }
