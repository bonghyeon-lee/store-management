import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: ['../schemas/*.graphql'],
  documents: ['src/**/*.graphql'],
  generates: {
    'src/shared/api/generated/': {
      preset: 'client',
      plugins: []
    }
  }
};

export default config;


