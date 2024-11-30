import { eq, sql, tables, useDrizzle } from "../utils/drizzle";
import { usernameRegex } from "./register.post";
import bcrypt from "bcryptjs";

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}

export default defineEventHandler(async (h3) => {
  const contentType = getHeader(h3, "Content-Type");
  if (!contentType || contentType != "application/json")
    throw createError({ statusCode: 400, statusMessage: "JSON only endpoint" });
  const body = await readBody(h3);

  const username = body.username;
  const password = body.password;
  const data = body.data;

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

  // We've now authenticated the user, we can create their sync bucket

  const token = uuidv4();
  await db.run(
    sql`INSERT INTO buckets(token, userId, data) VALUES (${token}, ${user.id}, ${data})`
  );

  return { token };
});
