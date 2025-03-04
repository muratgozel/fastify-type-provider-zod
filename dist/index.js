"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializerCompiler = exports.ResponseValidationError = exports.validatorCompiler = exports.jsonSchemaTransform = exports.createJsonSchemaTransform = void 0;
var zod_to_json_schema_1 = require("zod-to-json-schema");
var defaultSkipList = [
    '/documentation/',
    '/documentation/initOAuth',
    '/documentation/json',
    '/documentation/uiConfig',
    '/documentation/yaml',
    '/documentation/*',
    '/documentation/static/*',
];
var zodToJsonSchemaOptions = {
    target: 'openApi3',
    $refStrategy: 'none',
};
var createJsonSchemaTransform = function (_a) {
    var skipList = _a.skipList;
    return function (_a) {
        var schema = _a.schema, url = _a.url;
        if (!schema) {
            return {
                schema: schema,
                url: url,
            };
        }
        var response = schema.response, headers = schema.headers, querystring = schema.querystring, body = schema.body, params = schema.params, hide = schema.hide, rest = __rest(schema, ["response", "headers", "querystring", "body", "params", "hide"]);
        var transformed = {};
        if (skipList.includes(url) || hide) {
            transformed.hide = true;
            return { schema: transformed, url: url };
        }
        var zodSchemas = { headers: headers, querystring: querystring, body: body, params: params };
        for (var prop in zodSchemas) {
            var zodSchema = zodSchemas[prop];
            if (zodSchema) {
                transformed[prop] = (0, zod_to_json_schema_1.zodToJsonSchema)(zodSchema, zodToJsonSchemaOptions);
            }
        }
        if (response) {
            transformed.response = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (var prop in response) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                var schema_1 = resolveSchema(response[prop]);
                var transformedResponse = (0, zod_to_json_schema_1.zodToJsonSchema)(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                schema_1, zodToJsonSchemaOptions);
                transformed.response[prop] = transformedResponse;
            }
        }
        for (var prop in rest) {
            var meta = rest[prop];
            if (meta) {
                transformed[prop] = meta;
            }
        }
        return { schema: transformed, url: url };
    };
};
exports.createJsonSchemaTransform = createJsonSchemaTransform;
exports.jsonSchemaTransform = (0, exports.createJsonSchemaTransform)({
    skipList: defaultSkipList,
});
var validatorCompiler = function (_a) {
    var schema = _a.schema;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (data) {
        try {
            return { value: schema.parse(data) };
        }
        catch (error) {
            return { error: error };
        }
    };
};
exports.validatorCompiler = validatorCompiler;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
function resolveSchema(maybeSchema) {
    if (hasOwnProperty(maybeSchema, 'safeParse')) {
        return maybeSchema;
    }
    if (hasOwnProperty(maybeSchema, 'properties')) {
        return maybeSchema.properties;
    }
    throw new Error("Invalid schema passed: ".concat(JSON.stringify(maybeSchema)));
}
var ResponseValidationError = /** @class */ (function (_super) {
    __extends(ResponseValidationError, _super);
    function ResponseValidationError(validationResult) {
        var _this = _super.call(this, "Response doesn't match the schema") || this;
        _this.name = 'ResponseValidationError';
        _this.details = validationResult.error;
        return _this;
    }
    return ResponseValidationError;
}(Error));
exports.ResponseValidationError = ResponseValidationError;
var serializerCompiler = function (_a) {
    var maybeSchema = _a.schema;
    return function (data) {
        var schema = resolveSchema(maybeSchema);
        var result = schema.safeParse(data);
        if (result.success) {
            return JSON.stringify(result.data);
        }
        throw new ResponseValidationError(result);
    };
};
exports.serializerCompiler = serializerCompiler;
