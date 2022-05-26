import { NextFunction } from "express";
import { TypedRequest, TypedResponse } from "../types";

function authMdw(
    request: TypedRequest,
    response: TypedResponse,
    next: NextFunction
) {
    next();
}

export default authMdw;
