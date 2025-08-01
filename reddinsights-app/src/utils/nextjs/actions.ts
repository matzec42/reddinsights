import { hashPassword, generateSalt } from "../core/passwordHasher";

export async function signUp(unsafeData: unknown) {
    // if (!success) return "Unable to create account";

    // const existingUser = await db.query ---> logic for querying MongoDB w/ hashed PW

    // if (existingUser !==null) return "Account already exists for this email"

    // const hashedPassword = await hashPassword(data.password, generateSalt());

    // redirect("/")
}

export async function logOut() {
    // logic to end session, redirect user to home/login page

    // redirect("/")
}