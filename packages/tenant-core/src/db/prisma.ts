import { PrismaClient } from '@prisma/client';
import { getTenantId } from '../context/tenantContext';

const basePrisma = new PrismaClient();

/**
 * Prisma extension to automatically enforce tenant isolation.
 * Any query made using `prisma` will inherently have `tenantId` injected,
 * preventing cross-tenant data leakage.
 */
export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }: any) {
        // We only append tenantId to models that have it.
        // Assuming every primary tenant model has 'tenantId'.
        
        // Skip for global models if needed (e.g., SuperAdmin, GlobalConfig)
        const globalModels = ['GlobalConfig', 'Tenant']; 
        if (globalModels.includes(model)) {
          return query(args);
        }

        const tenantId = getTenantId();

        if (operation === 'findUnique' || operation === 'findFirst' || operation === 'findMany' || operation === 'count') {
          args.where = { ...args.where, tenantId };
        } else if (operation === 'create' || operation === 'createMany') {
          if ((args as any).data) {
            if (Array.isArray((args as any).data)) {
              (args as any).data = (args as any).data.map((d: any) => ({ ...d, tenantId }));
            } else {
              (args as any).data.tenantId = tenantId;
            }
          }
        } else if (operation === 'update' || operation === 'updateMany' || operation === 'delete' || operation === 'deleteMany') {
          args.where = { ...args.where, tenantId };
        }

        return query(args);
      },
    },
  },
});
