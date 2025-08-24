export function swaggerRouteDoc({
  tags,
  summary,
  requestBodySchemaRef,
  responses,
}: {
  tags: string[];
  summary: string;
  requestBodySchemaRef?: string;
  responses: object;
}) {
  const doc: any = {
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
