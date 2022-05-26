import { Query, Send } from "express-serve-static-core";

type Token = { token: string; expiresIn: number; expirationDateValue: number };

interface TypedRequest<
    U = Record<string, never>,
    T extends Query = Record<string, never>
> extends Express.Request {
    body: U;
    query: T;
}

interface TypedResponse<T = Record<string, never>> extends Express.Response {
    json: Send<T, this>;
}
