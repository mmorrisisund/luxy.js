'use strict'

const defaults = {
  wrapperId: 'luxy',
  targetClass: '.luxy-el',
  wrapperSpeed: 0.08,
  targetSpeed: 0.02,
  targetPercentage: 0.1,
}

const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame
window.requestAnimationFrame = requestAnimationFrame
const cancelAnimationFrame =
  window.cancelAnimationFrame || window.mozCancelAnimationFrame

class Luxy {
  isAnimate = false
  isResize = false
  scrollId = ''
  resizeId = ''
  constructor(targets = [], wrapper = '', windowHeight = 0, wrapperOffset = 0) {
    this.Targets = targets
    this.wrapper = wrapper
    this.windowHeight = windowHeight
    this.wrapperOffset = wrapperOffset
  }

  init = (options = {}) => {
    this.settings = Object.assign(defaults, options)
    this.wrapper = document.getElementById(this.settings.wrapperId)

    if (this.wrapper === 'undefined') return false

    this.targets = document.querySelectorAll(this.settings.targetClass)
    document.body.style.height = this.wrapper.clientHeight + 'px'

    this.windowHeight = window.clientHeight
    this.attachEvent() // listen to resize event
    this.apply(this.targets) // init parallax targets
    this.animate() // listen for scrolls
    this.resize()
  }
  apply = (targets = []) => {
    this.wrapperInit()

    targets.forEach(target => {
      const attrs = {
        offset: target.getAttribute('data-offset'),
        speedX: target.getAttribute('data-speed-x'),
        speedY: target.getAttribute('data-speed-y'),
        percentage: target.getAttribute('data-percentage'),
        horizontal: target.getAttribute('data-horizontal'),
      }
      this.targetsInit(target, attrs)
    })
  }
  wrapperInit = () => {
    this.wrapper.style.width = '100%'
    this.wrapper.style.position = 'fixed'
  }
  targetsInit = (el, attrs) => {
    this.Targets.push({
      el,
      offset: attrs.offset ?? 0,
      horizontal: attrs.horizontal ?? 0,
      top: 0,
      left: 0,
      speedX: attrs.speedX ?? 1,
      speedY: attrs.speedY ?? 1,
      percentage: attrs.percentage ?? 0,
    })
  }
  scroll = () => {
    // scroll screen up/down
    this.scrollTop =
      document.documentElement.scrollTop ?? document.body.scrollTop // current scroll location
    this.wrapperUpdate()

    // move parallax elements
    this.Targets.forEach(this.targetsUpdate)
  }
  animate = () => {
    this.scroll()
    this.scrollId = requestAnimationFrame(this.animate)
  }
  wrapperUpdate = () => {
    // wrapperOffset is actual current location
    // speed percentage of separation
    this.wrapperOffset +=
      (this.scrollTop - this.wrapperOffset) * this.settings.wrapperSpeed
    this.wrapper.style.transform = `translate3d(0,${
      Math.round(-this.wrapperOffset * 100) / 100
    }px,0)`
  }
  targetsUpdate = target => {
    target.top +=
      (this.scrollTop *
        Number(this.settings.targetSpeed) *
        Number(target.speedY) -
        target.top) *
      this.settings.targetPercentage
    target.left +=
      (this.scrollTop *
        Number(this.settings.targetSpeed) *
        Number(target.speedX) -
        target.left) *
      this.settings.targetPercentage

    const targetOffsetTop = -target.top - Number(target.offset)
    let offsetY = Math.round(targetOffsetTop * -100) / 100
    let offsetX = 0

    if (target.horizontal) {
      const targetOffsetLeft = -target.left - parseInt(target.offset)
      offsetX = Math.round(targetOffsetLeft * -100) / 100
    }

    target.el.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`
  }
  resize = () => {
    this.windowHeight =
      window.innerHeight ?? document.documentElement.clientHeight ?? 0

    if (
      parseInt(
        this.wrapper.clientHeight !== parseInt(document.body.style.height)
      )
    ) {
      document.body.style.height = this.wrapper.clientHeight + 'px'
    }

    this.resizeId = requestAnimationFrame(this.resize)
  }
  attachEvent = () => {
    window.addEventListener('resize', () => {
      if (this.isResize) {
        cancelAnimationFrame(this.resizeId)
        cancelAnimationFrame(this.scrollId)

        // debounce calls
        this.isResize = true
        setTimeout(() => {
          this.isResize = false
          this.resizeId = requestAnimationFrame(this.resize)
          this.scrollId = requestAnimationFrame(this.resize)
        }, 200)
      }
    })
  }
  cancel = () => {
    cancelAnimationFrame(this.resizeId)
    cancelAnimationFrame(this.scrollId)
    this.wrapper.removeAttribute('style')
    this.Targets.forEach(target => target.el.removeAttribute('style'))
    this.wrapper = ''
    this.Targets = []
    this.windowHeight = 0
    this.wrapperOffset = 0
    this.isResize = false
    this.scrollId = ''
    this.resizeId = ''
  }
}

export default Luxy
