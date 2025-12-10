(Symbol as { metadata: symbol }).metadata = Symbol('Symbol.metadata');

export { default as Hook } from '@/elements/hook';
export { default as Reactive } from '@/elements/reactive';
export { default as Runner } from '@/elements/runner';
export { default as Store } from '@/elements/store';
export { default as OmniKernel } from '@/omniKernel';
export { OmniFacadeElement, OmniUnit } from '@/utilities/baseClasses';
export { manifest } from '@/utilities/manifest';
