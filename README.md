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
  <a href="#️-brief-introduction">Introduction</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-get-involved">Get Involved</a> •
  <a href="#-license-and-copyright">License</a>
</p>

## ✒️ Brief Introduction

As your apps grow, they often drown in "spaghetti" code — entangled states, APIs, and lifecycles that become impossible to maintain or extend.

`OmniKernel` cuts through the chaos: a lightweight TypeScript framework unifying **dependency injection**, **standardized facades**, **modular architecture**, and **state/lifecycle management**. Build truly modular, extensible applications for any environment — frontend, backend, or OS kernels.

Core to `OmniKernel` are `OmniUnit` classes for your app logic. Dynamically loaded with DI, each unit receives a DOM-like **facade tree** — our key innovation. Here, functions nest executable and traversable properties via `OmniFacadeElement` (think `HTMLElement`), enabling infinite extensibility through hooks, stores, and custom behaviors.

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

## 🤝 Get Involved

This project welcomes anyone that have ideas to improve it.

- [Read contributing guidelines](./CONTRIBUTING.md) before submitting a pull request.
- [Open an issue](https://github.com/hesprs/omnikernel/issues/new) if you find a bug.
- [Start a new thread in Discussions](https://github.com/hesprs/omnikernel/discussions/new) if you have feature requests or questions, please avoid posting them in Issues.
- [Report a vulnerability](https://github.com/hesprs/omnikernel/security/advisories/new) if you find one, please do not disclose it publicly.

## 📜 License and Copyright

[Apache License 2.0](./LICENSE) | Copyright ©️ 2025 Hesprs (Hēsperus)