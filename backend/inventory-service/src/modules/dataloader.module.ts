import { Module, Global } from '@nestjs/common';
import { ProductResolver } from '../resolvers/product.resolver';

@Global()
@Module({
  providers: [ProductResolver],
  exports: [ProductResolver],
})
export class DataLoaderModule {}
