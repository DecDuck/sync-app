import { eq, tables, useDrizzle } from "../utils/drizzle";

export default defineEventHandler(async (h3) => {
  const contentType = getHeader(h3, "Content-Type");
  if (!contentType || contentType != "application/json")
    throw createError({ statusCode: 400, statusMessage: "JSON only endpoint" });
  const body = await readBody(h3);

  const token = body.token;
  const data = body.data;

  if (!token || typeof token != "string")
    throw createError({
      statusCode: 400,
      statusMessage: "Token must be a string",
    });

  if (!data || typeof data != "string")
    throw createError({
      statusCode: 400,
      statusMessage: "Data must be a string",
    });

  const db = await useDrizzle();
  await db
    .update(tables.syncBucket)
    .set({ data: data })
    .where(eq(tables.syncBucket.token, token));
});
