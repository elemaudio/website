# Native Integrations
By design, Elementary's native renderer and audio engine aim to easily fit into your audio
processing stack to take on as much or as little of the processing responsibilities
as you want. The renderer and engine can be embedded independently of any JavaScript
processing, through a quick series of CMake and C++ steps which we
outline here.

Additionally, the native renderer and lib functions can be used to create language bindings for Elementary in other languages without re-implementing the Renderer logic.

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

Now that we've got that dependency in place, we can make use of the following classes:
1. `elem::Runtime<FloatType>` for _processing_ the audio graph.
2. `elem::Renderer<FloatType>` for _rendering_ the audio graph via Elementary lib functions in the `elem::lib` namespace. You can use this renderer instead of the JavaScript renderer when you are working in a native application.

These two classes are typically the only pieces of the Elementary native engine that you need to pay any attention to, and using them properly only involves a handful of steps:

1. Create the Runtime instance with your desired float type (`float` or `double`), sample rate, and block size
2. Create a Renderer instance and give it a reference to your Runtime
3. Process audio on the real-time thread (or wherever you need)
4. (Optional) Process events periodically on the main thread
5. Call `Renderer::renderGraph(...)` whenever you want to make changes to the audio graph

Here is an example of a simple C++ program which renders a simple graph and processes a block of audio on the main thread.

```cpp
#include <lib/Oscillators.h>
#include <Runtime.h>

int main(int argc, char** argv) {
    auto runtime = std::make_shared<elem::Runtime<float>>(44100.0, 512);
    auto renderer = Renderer<float>(runtime);

    renderer.renderGraph({elem::lib::cycle(440.0), elem::lib::cycle(440.0)});

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

This example is an abbreviated example of the `elemcli-native` command line tool available [in the Github repository](https://github.com/elemaudio/elementary/tree/main/cli-native).

### Using the Runtime with the JavaScript API
If you would like to integrate with a javascript environment instead of using the native renderer, you could do it like this:

1. Create the Runtime instance with your desired float type (`float` or `double`), sample rate, and block size
2. Set up a message passing interface to receive instructions from your JavaScript environment and apply them to the runtime
3. Process audio on the real-time thread (or wherever you need)
4. (Optional) Process events periodically on the main thread

As an example, here we'll show another simple C++ program which runs the Runtime instance next to an embedded JavaScript engine
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

This example is an abbreviated example of the `elemcli` command line tool available [in the Github repository](https://github.com/elemaudio/elementary/tree/main/cli).

## Creating bindings for C++ compatible compiled languages
Using the native Renderer and Elementary lib functions, creating bindings for a compiled language becomes relatively straightforward. You simply need to create a wrapper around the `elem::Runtime<FloatType>` and `elem::Renderer<FloatType>` classes, and functions to wrap the `elem::lib` library of Elementary node functions so that consumers of the package can construct their audio graph and pass it to the Renderer. Then, they can set up the Runtime and call its process method from the realtime audio thread in a manner appropriate to the given platform.

See [Elementary Swift](https://github.com/parkernilson/elementary-swift) or any of the other bindings in [Other Languages](../other_languages/community-supported-language-bindings.md) for examples of how this can be done.

## A note on the JavaScript Renderer vs Native Renderer
Since the javascript renderer (see [@elemaudio/web-renderer](../packages/web-renderer.md)) expresses its declarative API through JavaScript, the renderer and graph reconciliation algorithm were built in the JavaScript layer to minimize the amount of data passed through the JavaScript <-> C++ boundary (which involves serialization and deserialization of large JSON data). For example, in the case where a single keyed constant leaf node changes its value, only a single setProperty instruction needs to be sent across the boundary to the Runtime, which is far more efficient than sending the entire virtual audio graph representation.

However, in use cases where the app logic is written in a compiled language capable of including C++ code, we do not have that limitation. Therefore, the Native Renderer is provided so that each new language binding does not have to re-implement the Renderer and node library.

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

### findNode
Find a node in the current node table. Used by the Renderer to reconcile the requested audio graph state with the current audio graph state.

Returns a `nullptr` if the node is not found.
```cpp
GraphNode<FloatType> const* Runtime<FloatType>::findNode(NodeId const& id)
```

### getCurrentRoots
Returns a set containing the hashes of the currently active roots. Used by the reconciliation algorithm to determine which roots to activate.
```cpp
const std::set<NodeId>& Runtime<FloatType>::getCurrentRoots()
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

## Renderer API
### Constructor
```cpp
Rendererer(std::shared_ptr<Runtime> runtime);
```

### renderGraph
Renders a graph of `std::shared_ptr<NodeRepr>` (each with children: `std::vector<std::shared_ptr<NodeRepr>>`). These graphs can be created with the Elementary lib functions in namespace `elem::lib` which are the C++ implementation of the JavaScript lib functions.

```cpp
struct RenderOptions {
    int32_t fadeInMs = 20;
    int32_t fadeOutMs = 20;
};

struct RenderResult {
    int result = 0;
    int32_t nodesAdded = 0;
    int32_t edgesAdded = 0;
    int32_t propsWritten = 0;
    double elapsedTimeMs = 0.0;
};

RenderResult renderGraph(std::vector<std::shared_ptr<NodeRepr>> graphs, RenderOptions options = {});
```

### createRef
C++ implementation of [createRef](../guides/Using_Refs.md).

```cpp
struct NodeRef {
    std::shared_ptr<NodeRepr> node;
    std::function<RenderResult(js::Object newProps)> setter;
};

NodeRef createRef(std::string kind, js::Object props, std::vector<std::shared_ptr<NodeRepr>> children);
```