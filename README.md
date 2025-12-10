<h1 align="center">
  <img src="./assets/logo.svg" alt="OmniKernel" width="280px">
  <br>
</h1>

<h4 align="center">The ultimate modularity orchestrator that streamlines EVERYTHING.</h4>

<p align="center">
  <a href="https://codecov.io/github/Hesprs/OmniKernel">
    <img src="https://img.shields.io/codecov/c/github/hesprs/omnikernel/main?style=flat&logo=codecov&logoColor=white&label=Test%20Coverage&labelColor=ff0077&color=333333" alt="Test Coverage">
  </a>
  <a href="https://www.codefactor.io/repository/github/hesprs/omnikernel">
    <img src="https://img.shields.io/codefactor/grade/github/hesprs/omnikernel?style=flat&logo=codefactor&logoColor=white&label=Code%20Quality&labelColor=17b37a&color=333333" alt="Code Quality">
  </a>
  <a href="https://github.com/hesprs/omnikernel/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/hesprs/omnikernel/ci-main.yml?style=flat&logo=github&logoColor=white&label=CI%20for%20Main&labelColor=34c15d&color=333333" alt="CI Status">
  </a>
</p>

<p align="center">
  <a href="#✒️-brief-introduction">Introduction</a> •
  <a href="#🎬-quick-start">Quick Start</a> •
  <a href="#🖐️-get-involved">Get Involved</a> •
  <a href="#📜-license-and-copyright">License</a>
</p>

## ✒️ Brief Introduction

As your app grows, you may find yourself swimming in a sea of "spaghetti" code that intertwine with each other, each part with its unique states, APIs and lifecycles. You become overwhelmed, and the project becomes difficult to understand, maintain or extend.

`OmniKernel` comes to be a lightweight TypeScript-native orchestration framework that solves all the issues above. It unifies **dependency injection**, **standardized facade pattern**, **modular architecture**, **state management**, and **lifecycle management**, streamlining the development of **modularized, reusable, and extensible** applications. It is applicable to any development scenarios: front-end, back-end, or even operating systems.

The basic functioning piece in `OmniKernel` is a `OmniUnit`, which is an extensible base class that your logic resides. These units would be passed into the kernel to be loaded dynamically with DI during runtime. After instantiation, each unit is allocated a DOM-like facade tree, which is a key innovation of `OmniKernel`.

Each facade is a function-based tree where functions contain functions as their properties, which means a container function can be both executable and traversable. Underlying each function comes the `OmniFacadeElement`, akin to `HTMLElement`, which is extended for infinite functionalities, e.g. hooks, reactive stores, and your own customizations.

## 🎬 Quick Start

Install using a package manager:

```bash
# npm
npm add omnikernel

# pnpm
pnpm add omnikernel

# yarn
yarn add omnikernel

body
```

Or via CDN:

```html
<!-- add this line to your html file -->
<script src="https://cdn.jsdelivr.net/npm/omnikernel@latest/dist/index.cjs"></script>
```

## 🖐️ Get Involved

This project welcomes anyone that have ideas to improve it.

- [Read contributing guidelines](./CONTRIBUTING.md) before submitting a pull request.
- [Open an issue](https://github.com/hesprs/omnikernel/issues/new) if you find a bug.
- [Start a new thread in Discussions](https://github.com/hesprs/omnikernel/discussions/new) if you have a feature requests or questions, please avoid posting them in Issues.
- [Report a vulnerability](https://github.com/hesprs/omnikernel/security/advisories/new) if you find one, please do not disclose it publicly.

## 📜 License and Copyright

[Apache License 2.0](./LICENSE) | Copyright ©️ 2025 Hesprs (Hēsperus)