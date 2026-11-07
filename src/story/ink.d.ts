// An imported .ink file is its compiled story JSON. The Vite plugin in scripts/vite-plugin-ink.ts compiles it.
declare module "*.ink" {
  const story: Record<string, unknown>;
  export default story;
}
