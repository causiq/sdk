export default function subscribeToBodyMutations(observer: MutationObserver) {
  const bodyList = document.querySelector("body")
  if (bodyList == null) return

  observer.observe(bodyList, {
    childList: true,
    subtree: true
  })
}
