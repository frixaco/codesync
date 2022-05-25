import { Query, Send } from 'express-serve-static-core';

type Token = { token: string, expiresIn: number, expirationDateValue: number }

interface TypedRequest<U, T extends Query = {}> extends Express.Request {
    body: U,
    query: T
}

interface TypedResponse<T> extends Express.Response {
   json: Send<T, this>;
}
