import { eq, tables, useDrizzle } from "../utils/drizzle";

export default defineEventHandler(async (h3) => {
  const query = getQuery(h3);
  const token = query.token;

  if (!token || typeof token != "string")
    throw createError({
      statusCode: 400,
      statusMessage: "Token required in query",
    });

  const db = await useDrizzle();
  const buckets = await db
    .select()
    .from(tables.syncBucket)
    .where(eq(tables.syncBucket.token, token));
  if (buckets.length != 1)
    throw createError({ statusCode: 403, statusMessage: "Invalid token" });

  return { data: buckets[0].data };
});
