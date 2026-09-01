const { spawnSync } = require('node:child_process');
const {
  copyFileSync,
  chmodSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
} = require('node:fs');
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

function ensurePrismaEngineExecutable() {
  if (process.platform === 'win32') return;

  const enginesDir = join(
    process.cwd(),
    'node_modules',
    '@prisma',
    'engines',
  );
  if (!existsSync(enginesDir)) return;

  for (const fileName of readdirSync(enginesDir)) {
    if (fileName.startsWith('schema-engine-')) {
      chmodSync(join(enginesDir, fileName), 0o755);
    }
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
  ensurePrismaEngineExecutable();
  // The API app uses the shared repository root, so initialize Prisma before
  // compiling the NestJS bundle on Hostinger.
  runNpm(['run', 'prisma:generate']);
  runNpm(['run', 'prisma:db:push']);
  runNpm(['run', 'build:api:production']);

  // Ensure root, dist, and dist/api entry points exist for ANY Hostinger configuration
  const distDir = join(process.cwd(), 'dist');
  const distApiDir = join(process.cwd(), 'dist', 'api');
  const nestedDistDir = join(process.cwd(), 'dist', 'dist', 'api');
  const nestedDistApiDir = join(process.cwd(), 'dist', 'api', 'dist', 'api');

  if (!existsSync(distApiDir)) {
    mkdirSync(distApiDir, { recursive: true });
  }
  if (!existsSync(nestedDistApiDir)) {
    mkdirSync(nestedDistApiDir, { recursive: true });
  }
  if (!existsSync(nestedDistDir)) {
    mkdirSync(nestedDistDir, { recursive: true });
  }

  // Hostinger promotes only the configured output directory. Make dist/api a
  // complete Node application rather than a directory containing only a
  // webpack bundle; otherwise the promotion succeeds with an empty release.
  const rootPackage = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
  );
  function createRuntimePackage(outputDir, mainFile) {
    const runtimePackage = {
      name: `${rootPackage.name}-api`,
      version: rootPackage.version,
      private: true,
      main: mainFile,
      scripts: {
        start: `node ${mainFile}`,
        postinstall:
          'node node_modules/prisma/build/index.js generate --schema prisma/schema.prisma',
      },
      dependencies: {
        ...rootPackage.dependencies,
        prisma: rootPackage.devDependencies.prisma,
      },
      prisma: {
        schema: 'prisma/schema.prisma',
      },
    };

    const runtimePrismaDir = join(outputDir, 'prisma');
    mkdirSync(runtimePrismaDir, { recursive: true });
    copyFileSync(
      join(process.cwd(), 'prisma', 'schema.prisma'),
      join(runtimePrismaDir, 'schema.prisma'),
    );
    writeFileSync(
      join(outputDir, 'package.json'),
      `${JSON.stringify(runtimePackage, null, 2)}\n`,
    );
  }

  // Hostinger commonly auto-detects NestJS output as `dist`, while custom
  // configurations may use `dist/api`. Support both promotion layouts.
  createRuntimePackage(distDir, 'api/main.js');
  createRuntimePackage(distApiDir, 'main.js');

  // Root wrappers
  writeFileSync(join(process.cwd(), 'main.js'), 'require("./dist/api/main.js");\n');
  writeFileSync(join(process.cwd(), 'server.js'), 'require("./dist/api/main.js");\n');
  writeFileSync(join(process.cwd(), 'index.js'), 'require("./dist/api/main.js");\n');
  writeFileSync(join(process.cwd(), 'app.js'), 'require("./dist/api/main.js");\n');

  // dist wrappers
  writeFileSync(join(distDir, 'main.js'), 'require("./api/main.js");\n');
  writeFileSync(join(distDir, 'server.js'), 'require("./api/main.js");\n');
  writeFileSync(join(distDir, 'index.js'), 'require("./api/main.js");\n');
  writeFileSync(join(distDir, 'app.js'), 'require("./api/main.js");\n');

  // dist/dist/api wrappers (when output_dir=dist and entry=dist/api/main.js)
  writeFileSync(join(nestedDistDir, 'main.js'), 'require("../../api/main.js");\n');
  writeFileSync(join(nestedDistDir, 'server.js'), 'require("../../api/main.js");\n');
  writeFileSync(join(nestedDistDir, 'index.js'), 'require("../../api/main.js");\n');

  // dist/api wrappers
  writeFileSync(join(distApiDir, 'server.js'), 'require("./main.js");\n');
  writeFileSync(join(distApiDir, 'index.js'), 'require("./main.js");\n');
  writeFileSync(join(distApiDir, 'app.js'), 'require("./main.js");\n');

  // Nested dist/api/dist/api wrappers (in case Hostinger searches output_dir/entry_file)
  writeFileSync(join(nestedDistApiDir, 'main.js'), 'require("../../main.js");\n');
  writeFileSync(join(nestedDistApiDir, 'server.js'), 'require("../../main.js");\n');
  writeFileSync(join(nestedDistApiDir, 'index.js'), 'require("../../main.js");\n');

  console.log(
    '✅ Hostinger API artifact created with runtime package, Prisma schema, and entry point wrappers.',
  );
} else {
  // The existing frontend deployment continues to use the normal Angular
  // build when HOSTINGER_API_BUILD is not enabled.
  runNpm(['run', 'build:web']);
}
