import { z } from 'zod'

export enum SchemaType {
  /** String type. */
  STRING = 'string',
  /** Number type. */
  NUMBER = 'number',
  /** Integer type. */
  INTEGER = 'integer',
  /** Boolean type. */
  BOOLEAN = 'boolean',
  /** Array type. */
  ARRAY = 'array',
  /** Object type. */
  OBJECT = 'object',
}

// Helper function to check the type of Zod schema
export function getZodType(schema: any): string {
  return schema._def.typeName
}

export function toGeminiSchema(zodSchema: any): any {
  const zodType = getZodType(zodSchema)

  switch (zodType) {
    case 'ZodArray':
      return {
        type: SchemaType.ARRAY,
        items: toGeminiSchema(zodSchema.element),
      }
    case 'ZodObject':
      const properties: Record<string, any> = {}
      const required: string[] = []

      Object.entries(zodSchema.shape).forEach(([key, value]: [string, any]) => {
        properties[key] = toGeminiSchema(value)
        if (getZodType(value) !== 'ZodOptional') {
          required.push(key)
        }
      })

      return {
        type: SchemaType.OBJECT,
        properties,
        required: required.length > 0 ? required : undefined,
      }
    case 'ZodString':
      return {
        type: SchemaType.STRING,
        nullable: zodSchema.isOptional(),
      }
    case 'ZodNumber':
      return {
        type: SchemaType.NUMBER,
        nullable: zodSchema.isOptional(),
      }
    case 'ZodBoolean':
      return {
        type: SchemaType.BOOLEAN,
        nullable: zodSchema.isOptional(),
      }
    case 'ZodEnum':
      return {
        type: SchemaType.STRING,
        enum: zodSchema._def.values,
        nullable: zodSchema.isOptional(),
      }
    case 'ZodOptional':
      const innerSchema = toGeminiSchema(zodSchema._def.innerType)
      return { ...innerSchema, nullable: true }
    case 'ZodLiteral':
      const literalValue = zodSchema._def.value
      return {
        type: typeof literalValue === 'string' ? SchemaType.STRING : SchemaType.NUMBER,
        enum: [literalValue],
        nullable: zodSchema.isOptional(),
      }
    default:
      return {
        type: SchemaType.OBJECT,
        nullable: true,
      }
  }
}

export function toZodSchema(geminiSchema: any): any {
  switch (geminiSchema.type) {
    case SchemaType.ARRAY:
      return z.array(toZodSchema(geminiSchema.items))

    case SchemaType.OBJECT:
      const shape: Record<string, any> = {}
      Object.entries(geminiSchema.properties).forEach(([key, value]: [string, any]) => {
        let fieldSchema = toZodSchema(value)
        if (!geminiSchema.required || !geminiSchema.required.includes(key)) {
          fieldSchema = fieldSchema.optional()
        }
        shape[key] = fieldSchema
      })
      return z.object(shape)

    case SchemaType.STRING:
      if ('const' in geminiSchema) {
        return geminiSchema.nullable
          ? z.literal(geminiSchema.const).nullable()
          : z.literal(geminiSchema.const)
      }
      return geminiSchema.nullable ? z.string().nullable() : z.string()

    case SchemaType.NUMBER:
    case SchemaType.INTEGER:
      if ('const' in geminiSchema) {
        return geminiSchema.nullable
          ? z.literal(geminiSchema.const).nullable()
          : z.literal(geminiSchema.const)
      }
      return geminiSchema.nullable ? z.number().nullable() : z.number()

    case SchemaType.BOOLEAN:
      return geminiSchema.nullable ? z.boolean().nullable() : z.boolean()

    default:
      return geminiSchema.nullable ? z.any().nullable() : z.any()
  }
}
