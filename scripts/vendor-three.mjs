import { copyFile, mkdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
await mkdir(new URL('dist/vendor/', root), { recursive: true });
for (const file of ['three.module.js', 'three.core.js']) {
  await copyFile(new URL('node_modules/three/build/' + file, root), new URL('dist/vendor/' + file, root));
}
await copyFile(new URL('node_modules/three/LICENSE', root), new URL('dist/vendor/THREE-LICENSE.txt', root));
