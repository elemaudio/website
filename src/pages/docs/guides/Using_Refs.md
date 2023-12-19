# Using Refs

After reading [Understanding Keys](./Understanding_Keys.md) you'll know that keys are a tool to give Elementary the hints it needs to find structural similarity
in two graphs between nodes that share the same type but have different properties. In those scenarios, Elementary can satisfy the update by simply updating the
properties of the existing node in the running audio graph rather than attempt to mutate the graph itself.

This feature is an important part of Elementary's guiding methodology which is to write your audio processing graphs as a pure function of your application state–
when your application state changes, you can call that same function with the updated state, and simply ask Elementary to render the result. This model delegates
the complexity of addressing change over time to Elementary, so that you can simplify your own code. Of course, you might then be thinking: if I know in advance
that I only want to change a very particular property of an existing node, isn't it a lot of unnecessary work to build a new graph and run the
reconciliation process? With that question in mind we can now introduce "refs" in the Elementary graph model.

A ref in Elementary is ultimately a pair consisting of an Elementary graph node (like that which you would make with any of the `el.*` library methods), and a scoped
function containing a reference to that node in the context of the Renderer's internal state with which you can make precise property value updates without
the overhead of rebuilding and reconciling a new graph.

To create a ref, we can use the `createRef` method on your Renderer instance, which takes a set of arguments identical to the `createNode` method.

```js
let [cutoff, setCutoffFreq] = core.createRef("const", {value: 500}, []);
```

Upon creating the ref, we get back a pair with the first element being the graph node (in this case, a graph node equivalent to having written `el.const({value: 500})`),
and the second element being the scoped property value setter. At this point, we've created the pair, but until we _mount_ the graph node into the running graph, the
value setter will be useless. So let's do that:

```js
// A very simple graph running a lowpass filter over the input signal
core.render(el.lowpass(cutoff, 1.0, el.in({channel: 0})));
```

By now we would be hearing the result of our work, with a lowpassed version of the input signal coming through. Now suppose that we receive an event notifying
that the user has dragged a slider, in response to which we know precisely that we want to update the cutoff frequency of our filter. With refs, it's easy:

```js
// Called when our slider has changed, with a new value in the range [0, 1]
function sliderValueChanged(newValue) {
  // Map our [0, 1] value onto the desired cutoff frequency range
  let newCutoff = 200 + 2000 * newValue;

  // Update our ref
  setCutoffFreq({value: newCutoff});
}
```

To wrap up our explanation, it's helpful to understand that this workflow with refs supports any node type, and any set of properties. You can use this approach
any time you want to _change_ an existing property value for an existing node without otherwise changing the running graph. For example:

```js
// Creating a ref to an svf filter node
let [svf, setFilterProps] = createNode("svf", {mode: 'lowpass'}, [filterInput]);

// Mount the svf somewhere in our graph
core.render(...)

// Now we can dynamically change the filter mode
setFilterProps({mode: 'highpass'});
```

Of course, in this contrived example, we should note that instantaneously changing the filter type of a running SVF filter can cause a discontinuity. So while
you _can_ of course do this using refs, it's up to you if this particular use case with SVFs fits your needs. The point is more to show that refs are not restricted
to constant value nodes. You can use refs with any node (even a custom native node) and any properties you may wish to write.
