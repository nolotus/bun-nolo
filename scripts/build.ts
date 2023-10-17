
const env = process.env.NODE_ENV;
const isProduction = env ==='production';

const commonConfig = {
  entrypoints: ['./packages/web/entry.tsx'],
  outdir: './public',
}

const productionConfig = {
  ...commonConfig,
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true,
  }
}

const config = isProduction ? productionConfig : commonConfig;

export async function runBuild() {
  try {
    const result = await Bun.build(config);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

runBuild();