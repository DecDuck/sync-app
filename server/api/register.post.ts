import { sql, useDrizzle } from "~~/server/utils/drizzle";
import bcrypt from "bcryptjs";

// All lowercase, 5 to 11 characters
export const usernameRegex = /^[a-z]{5,11}$/g;

// https://emailregex.com/
const emailRegex =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

export default defineEventHandler(async (h3) => {
  const contentType = getHeader(h3, "Content-Type");
  if (!contentType || contentType != "application/json")
    throw createError({ statusCode: 400, statusMessage: "JSON only endpoint" });
  const body = await readBody(h3);

  const username = body.username;
  const email = body.email;
  const password = body.password;

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

  if (!email || typeof email != "string" || !email.match(emailRegex))
    throw createError({ statusCode: 400, statusMessage: "Invalid email" });

  if (!password || typeof password != "string" || password.length < 11)
    throw createError({
      statusCode: 400,
      statusMessage: "Password must be 11 characters or more.",
    });

  const passwordHash = bcrypt.hashSync(password);

  const db = await useDrizzle();
  await db.run(
    sql`INSERT INTO users (username, email, password, created_at) VALUES (${username}, ${email}, ${passwordHash}, ${Date.now()});`
  );

  return {};
});
