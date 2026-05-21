// Ambient module declarations for image assets imported with bundler
// suffixes. Mirrors the relevant subset of `vite/client` so this package
// type-checks without requiring consumers (or our own tsconfig) to pull
// in the full Vite client types.
declare module "*.png?url" {
    const src: string;
    export default src;
}
declare module "*.png" {
    const src: string;
    export default src;
}
declare module "*.svg?url" {
    const src: string;
    export default src;
}
declare module "*.jpg?url" {
    const src: string;
    export default src;
}
