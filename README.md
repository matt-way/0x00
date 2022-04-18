# 0x00 (NULL)

![null screenshot](screenshot.png)

## What is this?

Null is a new type of javascript IDE whose goal is to help you get your ideas to working code as fast as possible. It borrows elements from all sorts of different coding environments, but the key features are:

- Code is data driven, responding to changes from other code blocks.
- Code blocks have a persistent state, so you can change and run your code on the fly.
- Code blocks can be uploaded and shared (similar to npm, but higher specificity)
- Interactive properties can be created (eg. sliders, color and file pickers, etc).
- npm modules can be installed instantly for any block

## Installation / Setup

Currently there is no production build for Null, so below is how to get started using the dev environment.

```
clone the repo
npm install
npm run dev
```

Note that there are 3 concurrent processes running for this project. The first is the UI thread, which handles the IDE front end. The second is the Engine thread. This handles running the programs you create. The third is the electron app itself, housing everything. Each of these processes can be run independently if you want better logging in the console.

## Global Block Variables

There are a few variables available to your block code to make things easier. Some relate to the visual side of the engine, the state system, or just general helpers

### `element` & template helpers: (`md`, `html`)

This is the root dom element provided to the block. It is a `div` part of a shadow dom, so any styling, etc. won't pollute other block areas. To find children, use `element.querySelector()` instead of `document.getElementById()`, as shadow dom id's won't be accessible.

Also provided are helper string template literals to embed different content easily inside your block div. These run in order, and will overwrite each other if multiple are used. At the present time there are only two options. `md` for outputting markdown, and `html` for outputting raw html. For example.

```
md`##Hello, this is a title in markdown`
```

```
html`<h2 id="#title">This is a title using html</h2>`
```

### `state` & `stateUpdated(propertyName)`

This is the persistent state object for your block, as well as the glue that lets you read and write to block properties. Whenever the block is rerun (either via a code change or a connection update), this state persists with the same values. Only a full program reset will reset the state to an empty object.

If you set a value on the state whose key matches the name of a property, any block with a connection from this property will be rerun with this newly updated value.

For example:

```
// If the block has a property called myValue, then any other blocks this property connects to will be rerun
state.myValue = 100

// This will not trigger a state update, as only top level state keys are watched
state.myObject.childKey = 10

// this will force an update message that state.myObject has been updated, triggering a connected block rerun
stateUpdated(myObject)
```

### `onChange(runFunc, [depArray])`

Code inside a block reruns whenever the code changes, or whenever input state values change. Usually you want to run some sort of initialisation code that only runs once, or runs whenever specific values change. This can be done using the `onChange()` function. The inner function will only run once, and then any time the provided `depArray` values change. If no array is given, then the function only runs once. A full program reset will cause these functions to run again. It can be used multiple times, and they will run in execution order.

```
onChange(() => {
  html`<canvas id="c"/>` // This will setup the inner html only once
})

onChange(() => {
  // do something whenever specific state changes
}, [state.myValue])

console.log(element.querySelector('#c')) // this will log the canvas setup above.
```

**Cleanup on block removal**

Sometimes you want to run cleanup code when a block is removed. If you returns a function from within a `runOnce()` function, this function will be run whenever a block is removed. For example:

```
runOnce(() => {
  // do initialisation work here

  // return a function that you want to run when a block is removed
  return () => {
    // do cleanup here
  }
})
```

### Animations with `yield`

The engine that runs the blocks works with an internal `requestAnimationFrame()` system. Whenever you use the keyword `yield` inside a block, this tells the engine to jump out, and not jump back into the code until the next frame. This makes animating things quite easy. For example, the code below will render the numbers 0-599 in the output for each animation frame (a 10 second duration given a 60fps rate).

```
for(let i=0; i<600; i++){
  md`${i}`
  yield
}
```

### `__dirname`

This is the file system path for the block. It is useful for doing things like loading files that have block relative paths.
