const { spawnSync } = require('node:child_process');
const { existsSync, writeFileSync, mkdirSync } = require('node:fs');
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

function requireMySqlDatabaseUrl() {
  const databaseUrl = String(process.env.DATABASE_URL || '').trim();
  if (!databaseUrl) {
    console.error(
      'DATABASE_URL is required for the API deployment. Add the Hostinger MySQL connection URL before redeploying.',
    );
    process.exit(1);
  }

  if (!/^mysql:\/\//i.test(databaseUrl)) {
    console.error(
      'DATABASE_URL must be a MySQL URL for this API deployment (it should start with mysql://).',
    );
    process.exit(1);
  }
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
  requireMySqlDatabaseUrl();
  // The API app uses the shared repository root, so initialize Prisma before
  // compiling the NestJS bundle on Hostinger.
  runNpm(['run', 'prisma:generate']);
  runNpm(['exec', 'prisma', 'db', 'push']);
  runNpm(['run', 'build:api:production']);

  // Ensure root and dist/api entry points exist for any Hostinger configuration
  const distApiDir = join(process.cwd(), 'dist', 'api');
  if (!existsSync(distApiDir)) {
    mkdirSync(distApiDir, { recursive: true });
  }
  writeFileSync(join(process.cwd(), 'server.js'), 'require("./dist/api/main.js");\n');
  writeFileSync(join(process.cwd(), 'index.js'), 'require("./dist/api/main.js");\n');
  writeFileSync(join(distApiDir, 'server.js'), 'require("./main.js");\n');
  writeFileSync(join(distApiDir, 'index.js'), 'require("./main.js");\n');
  console.log('✅ Entry point wrappers verified (server.js, index.js, dist/api/main.js).');
} else {
  // The existing frontend deployment continues to use the normal Angular
  // build when HOSTINGER_API_BUILD is not enabled.
  runNpm(['run', 'build:web']);
}
