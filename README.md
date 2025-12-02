# OmniKernel v0.2.0

[![Codecov](https://img.shields.io/codecov/c/github/hesprs/omnikernel/main?style=flat&logo=codecov&logoColor=white&label=Test%20Coverage&labelColor=ff0077&color=333333)](https://codecov.io/github/Hesprs/OmniKernel)
[![CodeFactor](https://img.shields.io/codefactor/grade/github/hesprs/omnikernel?style=flat&logo=codefactor&logoColor=white&label=Code%20Quality&labelColor=17b37a&color=333333
)](https://www.codefactor.io/repository/github/hesprs/omnikernel)
[![github actions](https://img.shields.io/github/actions/workflow/status/hesprs/omnikernel/ci-main.yml?style=flat&logo=github&logoColor=white&label=CI%20for%20Main&labelColor=34c15d&color=333333
)](https://github.com/hesprs/omnikernel/actions)

**Description**: `OmniKernel` is a versatile and powerful kernel designed to provide a unified interface for managing and interacting with various types of modules, hooks, and functions, by maintaining a dynamic function-based and DOM-like `facade` and an underlying `facadeMap`. It offers a comprehensive set of features to enhance modularity, extensibility, and maintainability in your applications.

**Architecture**: a class containing `facade` tree where each node is a callable function that can contain children.

## Todo

- [ ] write doc.
- [ ] support `noChild` flag and `addChild` meta method.
- [x] add `delete` helper method to main class.
- [x] create `reactive` element.