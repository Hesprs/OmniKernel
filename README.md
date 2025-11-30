# OmniKernel v0.0.2

**Description**: `OmniKernel` is a versatile and powerful kernel designed to provide a unified interface for managing and interacting with various types of modules, hooks, and functions, by maintaining a dynamic function-based and DOM-like `facade` and an underlying `facadeMap`. It offers a comprehensive set of features to enhance modularity, extensibility, and maintainability in your applications.

**Architecture**: a class containing `facade` tree where each node is a callable function that can contain children.

## Todo

- [ ] write doc.
- [ ] support `noChild` flag and `addChild` meta method.
- [ ] add `delete` helper method to main class.
- [ ] create `reactive` amoeba.