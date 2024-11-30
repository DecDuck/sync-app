import { eq, tables, useDrizzle } from "../utils/drizzle";
import bcrypt from "bcryptjs";
import { usernameRegex } from "./register.post";

export default defineEventHandler(async (h3) => {
  const contentType = getHeader(h3, "Content-Type");
  if (!contentType || contentType != "application/json")
    throw createError({ statusCode: 400, statusMessage: "JSON only endpoint" });
  const body = await readBody(h3);

  const username = body.username;
  const password = body.password;
  const name = body.name;

  if (
    !username ||
    typeof username != "string" ||
    !username.match(usernameRegex)
  )
    throw createError({
      statusCode: 400,
      statusMessage:
        "Username must be only lowercase, and between 5 and 11 characters. ",
    });

  if (!password || typeof password != "string" || password.length < 11)
    throw createError({
      statusCode: 400,
      statusMessage: "Password must be 11 characters or more.",
    });

  if (!data || typeof data != "string")
    throw createError({
      statusCode: 400,
      statusMessage: "Data must be a string",
    });

  if (!name || typeof name != "string")
    throw createError({
      statusCode: 400,
      statusMessage: "Name must be a string",
    });

  const db = await useDrizzle();
  const users = await db
    .selectDistinct()
    .from(tables.users)
    .where(eq(tables.users.username, username));

  if (users.length != 1)
    throw createError({
      statusCode: 403,
      statusMessage: "Invalid credentials",
    });

  const user = users[0];
  if (!bcrypt.compareSync(password, user.password))
    throw createError({
      statusCode: 403,
      statusMessage: "Invalid credentials",
    });

  const buckets = await db
    .select()
    .from(tables.syncBucket)
    .where(eq(tables.syncBucket.name, name));

  if (buckets.length != 1)
    throw createError({ statusCode: 404, statusMessage: "Bucket not found" });

  return { token: buckets[0].token, data: buckets[0].data };
});
