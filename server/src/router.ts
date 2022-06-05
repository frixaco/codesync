import { login, signup } from "./auth";

export type Router = {
    // [method in "POST" | "GET"]?: {
    [method: string]: {
        [route: string]: (req: any, res: any) => Promise<any>;
    };
};

export const router: Router = {
    GET: {
        "/": async () => ({ message: "Hello World" }),
    },
    POST: {
        "/auth/login": login,
        "/auth/signup": signup,
    },
};
