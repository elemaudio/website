# Introduction

[**Elementary**](https://elementary.audio) is a JavaScript library for digital audio signal processing that
aims to make the process of writing audio software faster and more intuitive while producing high quality, resilient code.

* **Declarative:** Elementary makes it simple to create interactive audio processes through functional, declarative programming. Describe your audio process as a function of your application state, and Elementary will efficiently update the underlying audio engine as necessary.
* **Dynamic:** Most audio processing frameworks and tools facilitate building static processes. But what happens as your audio requirements change throughout the user journey? Elementary is designed to facilitate and adapt to the dynamic nature of modern audio applications.
* **Portable:** By decoupling the JavaScript API from the underlying audio engine (the "what" from the "how"), Elementary enables writing portable applications. Whether the underlying engine is running in the browser, an audio plugin, or an embedded device, your JavaScript layer remains the same.

To best understand Elementary, we recommend reading [Motivation](../docs/motivation), followed by [In Depth](../docs/in_depth). If you want to skip ahead
and get started, read on below.

## Getting Started

Every Elementary application starts with the [@elemaudio/core](../docs/packages/core) package, which provides the
framework for defining your audio processes and a generic set of utilities for performing the graph rendering and reconciling steps.

Next, because Elementary is designed to be used in a number of different environments, there are several different ways to integrate.
If you're new to the project, we recommend studying the following workflows to get the feel of working in Elementary:

* Use the [@elemaudio/web-renderer](../docs/packages/web-renderer) package with your favorite frontend UI library to make an audio web application
* Use the [@elemaudio/offline-renderer](../docs/packages/offline-renderer) package with Node.js for static file processing

Once you're ready to dive in, we suggest starting with one of these ideas:

* Jump into the [online playground](./playground) for the quickest way of experimenting with sound
* Make an audio effects plugin following the [SRVB plugin template](https://github.com/elemaudio/srvb)
* Try the small [command line tool](https://github.com/elemaudio/elementary/tree/main/cli) here in this repository to explore an example native integration
* Check out the [Native Integrations](../docs/guides/Native_Integrations) guide for embedding Elementary's C++ engine in your own native code
* Read the [Custom Native Nodes](../docs/guides/Custom_Native_Nodes) guide for extending Elementary's built-in DSP library with your own low-level processors


