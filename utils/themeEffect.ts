export const themeEffect = function () {
  if (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
    // 시스템 기본 설정이 다크 모드인 경우
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
