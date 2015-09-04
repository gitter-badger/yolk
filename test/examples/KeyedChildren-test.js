/** @jsx createElement */

const Rx = require(`rx`)
const createElement = require(`createElement`)
const eventHandler = require(`eventHandler`)
const render = require(`render`)

function Stub (props, children) {
  const handleClick = eventHandler(1)
  const count = handleClick.scan((acc, next) => acc + next, 0)

  return <p className="stub" onclick={handleClick}>{children}{count}</p>
}

describe(`children with keys`, () => {

  it(`does not destroy the previous instance of the child`, () => {
    const flipper = new Rx.BehaviorSubject()
    const children = flipper.scan(acc => [acc[1], acc[0]], [<Stub key="second">2</Stub>, <Stub key="first">1</Stub>])
    const component = <div key="wrapper">{children}</div>
    const node = document.createElement(`div`)
    render(component, node)

    const stubs = node.querySelectorAll(`.stub`)
    const first = stubs[0]
    const second = stubs[1]

    assert.equal(node.innerHTML, `<div><p class="stub">10</p><p class="stub">20</p></div>`)

    first.click()

    assert.equal(node.innerHTML, `<div><p class="stub">11</p><p class="stub">20</p></div>`)

    flipper.onNext(true)

    assert.equal(node.innerHTML, `<div><p class="stub">20</p><p class="stub">11</p></div>`)

    first.click()
    first.click()
    first.click()
    second.click()
    second.click()
    flipper.onNext(true)

    assert.equal(node.innerHTML, `<div><p class="stub">14</p><p class="stub">22</p></div>`)

    flipper.onNext(true)

    assert.equal(node.innerHTML, `<div><p class="stub">22</p><p class="stub">14</p></div>`)

  })

  it(`does not reset children as long as one of them is keyed`, () => {

    const flipper = new Rx.BehaviorSubject()
    const children = flipper.scan(acc => [acc[1], acc[2], acc[3], acc[0]], [<Stub>4</Stub>, <Stub key="first">1</Stub>, <Stub>2</Stub>, <Stub>3</Stub>])
    const component = <div key="wrapper">{children}</div>
    const node = document.createElement(`div`)
    render(component, node)

    const stubs = node.querySelectorAll(`.stub`)
    const first = stubs[0]
    const second = stubs[1]
    const third = stubs[2]
    const fourth = stubs[3]

    assert.equal(node.innerHTML, `<div><p class="stub">10</p><p class="stub">20</p><p class="stub">30</p><p class="stub">40</p></div>`)

    first.click()
    second.click()
    third.click()
    fourth.click()

    assert.equal(node.innerHTML, `<div><p class="stub">11</p><p class="stub">21</p><p class="stub">31</p><p class="stub">41</p></div>`)

    flipper.onNext(true)

    assert.equal(node.innerHTML, `<div><p class="stub">21</p><p class="stub">31</p><p class="stub">41</p><p class="stub">11</p></div>`)

  })

  it(`resets children if they aren't keyed`, () => {
    const flipper = new Rx.BehaviorSubject()
    const children = flipper.scan(acc => [acc[1], acc[0]], [<Stub>2</Stub>, <Stub>1</Stub>])
    const component = <div key="wrapper">{children}</div>
    const node = document.createElement(`div`)
    render(component, node)

    const stubs = node.querySelectorAll(`.stub`)
    const first = stubs[0]
    const second = stubs[1]

    assert.equal(node.innerHTML, `<div><p class="stub">10</p><p class="stub">20</p></div>`)

    first.click()
    second.click()

    assert.equal(node.innerHTML, `<div><p class="stub">11</p><p class="stub">21</p></div>`)

    flipper.onNext(true)

    assert.equal(node.innerHTML, `<div><p class="stub">11</p><p class="stub">21</p></div>`)

  })

})
