# OmniKernel v0.0.1

**Description**: `OmniKernel` is a versatile and powerful kernel designed to provide a unified interface for managing and interacting with various types of modules, hooks, and functions, by maintaining a dynamic function-based `root`. It offers a comprehensive set of features to enhance modularity, extensibility, and maintainability in your applications.

**Architecture**: a class containing `root` amoeba tree where each node is a callable function (amoeba) that can contain children. The kernel instances returns `root` directly.

**Disclaimer**:
- type precision is not required for `OmniKernel`, we will implement procedural type generation later.
- all underscore methods of an `amoeba` are designed for this `amoeba` only, not for its children.

## Root

The `root` is composed entirely of `amoeba` functions. Every node in the registry tree is an amoeba that can be called directly and can contain child amoebas. The pattern of an amoeba is:

```typescript
interface Amoeba extends Function {
  (...args: Array<any>): any; // default runner

  // Behavioral underscore fields
  _value?: any; // stored value
  _get?(): any; // custom getter
  _set?(...args: Array<any>): any; // called after assignment, when setting a new value
  _beforeMerge?(replaced?: Amoeba): any; // called when assigned to registry
  _beforeDispose?(): any; // called when deleted from registry
  _run?(...args: Array<any>): any; // override default runner
  _args?: { // metadata flags
    silent?: boolean;
    disabled?: boolean;
    immutable?: boolean;
    unreadable?: boolean;
    [key: string]: any;
  };

  // Amoeba signature
  _sig: string;

  // Children (other amoebas) or custom underscore fields
  [key: string]: Amoeba | any;
}
```

## Todo

- [ ] write doc
- [ ] complete `_beforeMerge` and `_beforeDispose` behavior: currently only called during amoeba replacement.
- [ ] create `reactive` amoeba.