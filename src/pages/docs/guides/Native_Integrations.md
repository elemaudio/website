# Native Integrations

By design, Elementary's native audio engine aims to easily fit into your audio
processing stack to take on as much or as little of the processing responsibilities
as you want. The engine can be embedded independently of any JavaScript
processing, through a quick series of CMake and C++ steps which we
outline here.

## CMake

To start, we add Elementary to your project with git submodules and CMake.

```bash
git submodule add https://github.com/elemaudio/elementary.git elementary
```

Then, in your `CMakeLists.txt`:

```cmake
# Add the runtime subdirectory
add_subdirectory(elementary/runtime)

# Make sure you link your target against the runtime
target_link_libraries(${TARGET_NAME} PRIVATE runtime)
```


## C++

Now that we've got the dependency in place, we can make an instance of the `elem::Runtime<FloatType>`. This Runtime
instance is typically the only piece of the Elementary native engine that you need to pay any attention to, and using
it properly only involves a handful of steps:

1. Create the Runtime instance with your desired float type (`float` or `double`), sample rate, and block size
2. Set up a message passing interface to receive instructions from your JavaScript environment and apply them to the runtime
3. Process audio on the real-time thread (or wherever you need)
4. (Optional) Process events periodically on the main thread

As an example, here we'll show a simple C++ program which runs the Runtime instance next to an embedded JavaScript engine
thanks to CHOC's Quickjs wrapper. We wire in a native interop method for receiving instructions from the JavaScript engine,
then evaluate some JavaScript, and finally process a couple blocks of audio on the main thread.

```cpp
#include <Runtime.h>


int main(int argc, char** argv) {
    elem::Runtime<float> runtime(44100.0, 512);

    auto ctx = choc::javascript::createQuickJSContext();

    ctx.registerFunction("__postInstructions__", [&](choc::javascript::ArgumentList args) {
        // Imagining here that we've JSON-stringified the instructions before calling into
        // this native interop method, so we must parse the instruction set from JSON before applying.
        runtime.applyInstructions(elem::js::parseJSON(args[0]->toString()));
        return choc::value::Value();
    });

    // Now that we have the message passing set up, we can evaluate our JavaScript containing the
    // Elementary frontend code
    auto rv = ctx.evaluate(inputFileContents);

    // And finally we can process some audio data
    runtime.process(
        inputBufferData,
        numInputChannels,
        outputBufferData,
        numOutputChannels,
        blockSize,
        nullptr, // userData
    );

    return 0;
}
```

This example is an abbreviated example of the command line tool available [in the Github repository](https://github.com/elemaudio/elementary/tree/main/cli).

## Runtime API

We'll end this guide with a brief enumeration of the `elem::Runtime<FloatType>` API:


### Constructor
```cpp
Runtime(double sampleRate, int blockSize);
```

### applyInstructions

Apply graph rendering instructions.

Depending on the message passing interface you select, you may
need to write your own serialization/deserialization step to the `elem::js::Value` type. There is a
provided `elem::js::parseJSON(std::string const& serialized)` utility for just this purpose if JSON suits
your needs.

```cpp
void applyInstructions(js::Array const& batch);
```

### process

Run the internal audio processing callback. The opaque `userData` pointer can be used to pass information
to custom audio processing nodes. See the [Custom Native Nodes](./Custom_Native_Nodes.md) guide for more details.

**Note**: `inputChannelData` and `outputChannelData` should not point to the same data.

```cpp
void process(
    const FloatType** inputChannelData,
    size_t numInputChannels,
    FloatType** outputChannelData,
    size_t numOutputChannels,
    size_t numSamples,
    void* userData = nullptr);
```

### processQueuedEvents

This raises events from the processing graph such as new data from analysis nodes
or errors encountered while processing. You may not need this method if you're not rendering
any analysis nodes (meter, snapshot, fft, scope, etc). If you do need such events, you will
want to call this method periodically on an interval that suits your requirements.

```cpp
void processQueuedEvents(std::function<void(std::string const&, js::Value)> evtCallback);
```

### reset

Reset the internal graph nodes.

This allows each node to optionally reset any internal state, such as
delay buffers or sample readers.

```cpp
void reset();
```

### gc

Step the internal garbage collection algorithm to clean up any unused nodes.

This method returns a set of NodeIds identifying any nodes that were actually cleaned
up during the pass.

```cpp
std::set<NodeId> gc();
```

**Note:** Garbage collection is initiated at the native layer with this method, and the IDs returned
must be passed to the corresponding [`prune`](../packages/core#rendererprune) method on the `Renderer` instance associated with this Runtime instance
to ensure the Renderer and the Runtime remain in sync.

As an example, the `OfflineRenderer` exposes a `gc()` method that coordinates between its own internal wasm Runtime
instance and its internal Renderer instance as follows,

```js
class OfflineRenderer {
  // ... omitted

  gc() {
    let pruned = this._native.gc();
    this._renderer.prune(pruned);
    return pruned;
  }

  // ... omitted
}
```

### addSharedResource

Loads a new shared buffer into memory.

This method populates an internal map from which any GraphNode can request a
shared pointer to the data. This, for example, is how `el.sample` resolves its `path` property.

```
bool addSharedResourceMap(std::string const& name, std::unique_ptr<elem::SharedResource> resource);
```

Returns false if the insertion failed (i.e. if the provided `name` was already taken during a prior insertion), and true otherwise.

You may derive your own SharedResource type by inheriting the `elem::SharedResource` interface for custom
behavior. There is an existing `AudioBufferResource` provided for the default use case:

```cpp
auto resource = std::make_unique<elem::AudioBufferResource>(audioChannelData, numChannels, numSamples);
auto result = runtime->addSharedResource(name, std::move(resource));
```

### pruneSharedResources

Removes and deallocates any unused shared resources in the internal resource map.

This method will retain any resource with references held by any node in the audio graph,
so it may be helpful to run a `gc()` pass before pruning resources to make sure unused nodes
don't prevent the cleanup of a particular resource by maintaining their reference.

```
void pruneSharedResources();
```

### pruneSharedResources

Returns an iterator through the names of the entries in the shared resoure map.

Intentionally, this does not provide access to the values in the map.

```cpp
SharedResourceMap::KeyViewType getSharedResourceMapKeys();
```

### registerNodeType

For registering custom GraphNode factory functions.

New node types must inherit GraphNode, and the factory function must produce a shared
pointer to a new node instance.

After registering your node type, the runtime instance will be ready to receive
instructions for your new type, such as those produced by the frontend
from, e.g., `core.render(createNode("myNewNodeType", props, [children]))`

See the [Custom Native Nodes](./Custom_Native_Nodes.md) guide for more details.

```cpp
using NodeFactoryFn = std::function<std::shared_ptr<GraphNode<FloatType>>(NodeId const id, double sampleRate, int const blockSize)>;
void registerNodeType (std::string const& type, NodeFactoryFn && fn);
```

