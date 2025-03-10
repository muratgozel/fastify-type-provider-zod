import type { FastifySchema, FastifySchemaCompiler, FastifyTypeProvider } from 'fastify';
import type { FastifySerializerCompiler } from 'fastify/types/schema';
import type { z, ZodAny, ZodTypeAny } from 'zod';
type FreeformRecord = Record<string, any>;
export interface ZodTypeProvider extends FastifyTypeProvider {
    output: this['input'] extends ZodTypeAny ? z.infer<this['input']> : never;
}
interface Schema extends FastifySchema {
    hide?: boolean;
}
export declare const createJsonSchemaTransform: ({ skipList }: {
    skipList: readonly string[];
}) => ({ schema, url }: {
    schema: Schema;
    url: string;
}) => {
    schema: Schema;
    url: string;
} | {
    schema: FreeformRecord;
    url: string;
};
export declare const jsonSchemaTransform: ({ schema, url }: {
    schema: Schema;
    url: string;
}) => {
    schema: Schema;
    url: string;
} | {
    schema: FreeformRecord;
    url: string;
};
export declare const validatorCompiler: FastifySchemaCompiler<ZodAny>;
export declare class ResponseValidationError extends Error {
    details: FreeformRecord;
    constructor(validationResult: FreeformRecord);
}
export declare const serializerCompiler: FastifySerializerCompiler<ZodAny | {
    properties: ZodAny;
}>;
export {};
