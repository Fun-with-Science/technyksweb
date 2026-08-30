const { spawnSync } = require('node:child_process');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const isApiBuild = process.env.HOSTINGER_API_BUILD === 'true';

function runNpm(args) {
  const result = spawnSync(npmCommand, args, { stdio: 'inherit' });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
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
