"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerRouteDoc = swaggerRouteDoc;
function swaggerRouteDoc({ tags, summary, requestBodySchemaRef, responses, }) {
    const doc = {
        tags,
        summary,
        responses,
    };
    if (requestBodySchemaRef) {
        doc.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: requestBodySchemaRef },
                },
            },
        };
    }
    return doc;
}
