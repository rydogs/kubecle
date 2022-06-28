import create from 'zustand'

const useK8sContext = create((set) => ({
  currentContext: '',
  currentNs: 'default',
  setContext: (context) => set(() => ({currentContext: context})),
  setNamespace: (namespace) => set(() => ({currentNs: namespace}))
}))

export default useK8sContext;