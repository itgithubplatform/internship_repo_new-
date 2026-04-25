import { PrismaClient, FormFieldType } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateFormDto {
  tenantId: string;
  title: string;
  description?: string;
  productId?: string;
  createdById: string;
  fields: {
    label: string;
    type: FormFieldType;
    placeholder?: string;
    isRequired: boolean;
    order: number;
    options?: string[]; // for select/radio
    validation?: any; // JSON string for Zod schemas
  }[];
}

export class FormService {
  async createForm(data: CreateFormDto) {
    return prisma.form.create({
      data: {
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        productId: data.productId,
        createdById: data.createdById,
        fields: {
          create: data.fields.map(f => ({
            label: f.label,
            type: f.type,
            placeholder: f.placeholder,
            isRequired: f.isRequired,
            order: f.order,
            options: f.options ? JSON.stringify(f.options) : null,
            validation: f.validation ? JSON.stringify(f.validation) : null,
          })),
        },
      },
      include: {
        fields: { orderBy: { order: 'asc' } },
      },
    });
  }

  async getFormsByTenant(tenantId: string, isActive?: boolean) {
    return prisma.form.findMany({
      where: {
        tenantId,
        ...(isActive !== undefined ? { isActive } : {}),
      },
      include: {
        fields: { orderBy: { order: 'asc' } },
      },
    });
  }

  async getFormById(formId: string, tenantId: string) {
    return prisma.form.findFirst({
      where: { id: formId, tenantId },
      include: {
        fields: { orderBy: { order: 'asc' } },
      },
    });
  }
}
