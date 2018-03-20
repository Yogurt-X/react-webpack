import AppStateClass from './app-state'

export const AppState = AppStateClass

export default {
  AppState,
}
// 用于服务端渲染
export const createStoreMap = () => ({
  appState: new AppState(),
})
