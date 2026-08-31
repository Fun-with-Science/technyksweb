const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { join } = require('node:path');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const isApiBuild = process.env.HOSTINGER_API_BUILD === 'true';

function runNpm(args) {
  const result = spawnSync(npmCommand, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function hasLocalNx() {
  return existsSync(join(process.cwd(), 'node_modules', 'nx', 'dist', 'bin', 'nx.js'));
}

// Hostinger can install only production dependencies before running the build.
// Nx is a build-time dependency, so restore the repository's dev dependencies
// when the build environment does not contain the local Nx executable.
if (!hasLocalNx()) {
  console.log('Nx is not installed; installing the repository build dependencies...');
  runNpm([
    'install',
    '--include=dev',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
  ]);
}

if (isApiBuild) {
  // The API app uses the shared repository root, so initialize Prisma before
  // compiling the NestJS bundle on Hostinger.
  runNpm(['run', 'prisma:generate']);
  runNpm(['exec', 'prisma', 'db', 'push']);
  runNpm(['run', 'build:api:production']);
} else {
  // The existing frontend deployment continues to use the normal Angular
  // build when HOSTINGER_API_BUILD is not enabled.
  runNpm(['run', 'build:web']);
}
