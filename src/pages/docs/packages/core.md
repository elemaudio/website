# @elemaudio/core

The official Elementary Audio core package; this package provides the standard library for composing
audio processing nodes, as well as utilities for constructing and addressing composite nodes. This package
also provides a set of core algorithms which can be used to build your own rendering utilities for custom
integrations.

## Installation

```js
npm install --save @elemaudio/core
```

## Usage

```js
import {
  el,
  createNode,
  isNode,
  resolve,
  Renderer,
} from '@elemaudio/core';
```

### el

A plain object through which you can access all of the available standard library nodes. For
documentation on exactly which nodes are available and what they do, see the Reference section of the docs on the sidebar.

### createNode

```js
function createNode(kind: string, props: Object, children: array<ElemNode>): NodeRepr_t;
```

A factory function for creating an audio node, `NodeRepr_t`. Every function available on `el` ultimately decays
to a series of calls to `createNode`.

Typically, you'll only need to pay attention to this API for referring to your own custom native nodes.

### isNode

```js
function isNode(a: any): bool;
```

A simple utility for identifying if the input argument is of type `NodeRepr_t`.

### resolve

```js
function resolve(n: NodeRepr_t | number): NodeRepr_t;
```

Very similar to the above `isNode`; this utility accepts an input which is either a `NodeRepr_t` or a `number`
and resolves to a `NodeRepr_t`.

### Renderer

The `Renderer` class is a generic utility for performing the graph rendering and reconciliation step. Both the
`offline-renderer` and the `web-renderer` are small proxies to distinct `Renderer` instances. This API is provided
for you to write your own Renderers depending on your app integration.

Using the generic Renderer requires just the constructor, and handling some message passing:

```js
const core = new Renderer((instructionBatch) => {
  // Send the instruction batch to your `elem::Runtime<FloatType>` instance, wherever that may be!
  // Perhaps this is a websocket send step, or perhaps calling a FFI interface in your JavaScript runtime,
  // or even just saving to file to perform snapshot regression testing like with Jest.
});
```

Afterwards, you can use the `render()` API just like you would expect with any other renderer:

```js
core.render(el.cycle(440), el.cycle(441));
```

The web-renderer and offline-renderer both follow this pattern, and simply wrap the above API into a larger
object which adds additional utility like event emitting and APIs which forward directly to the runtime.
