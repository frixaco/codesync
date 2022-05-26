import { Router } from "express";
import db from "../db";
import jwt from "jsonwebtoken";
import { Token, TypedRequest, TypedResponse } from "../types";
import {
    issueAccessToken,
    issueRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
} from "../helpers/jwt";

const router = Router();

interface LoginReq {
    email: string;
    password: string;
    accessToken: string;
    refreshToken: string;
}

interface LoginRes {
    email: string;
    accessToken: string;
    refreshToken: string;
}

router.post(
    "/login",
    async (req: TypedRequest<LoginReq>, res: TypedResponse<LoginRes>) => {
        try {
            const { email, password, accessToken, refreshToken } = req.body;

            const isUserExists = await db.user.findUnique({
                where: {
                    email,
                },
            });

            if (isUserExists) {
                res.json({ msg: `User already exists` });
            }

            const parsedAccessToken = await verifyAccessToken(accessToken);
            const parsedRefreshToken = await verifyRefreshToken(refreshToken);

            if (parsedAccessToken && email === parsedAccessToken.email) {
                res.json({
                    accessToken,
                    refreshToken,
                    email,
                });
            }

            res.json({
                email,
                accessToken: token,
                refreshToken: user.refreshToken,
            });
        } catch (error) {
            res.status(500).json({ msg: "Login error" });
        }
    }
);

interface SignupReq {
    email: string;
    password: string;
}

interface SignupRes {
    email?: string;
    accessToken?: Token;
    refreshToken?: Token;
    msg?: string;
}

router.post(
    "/signup",
    async (req: TypedRequest<SignupReq>, res: TypedResponse<SignupRes>) => {
        try {
            const { email, password } = req.body;

            const isUserExists = await db.user.findUnique({
                where: {
                    email,
                },
            });

            if (isUserExists) {
                return res.json({ msg: `User with ${email} already exists.` });
            }

            await db.user.create({
                data: {
                    email,
                    password,
                },
            });

            const accessToken = await issueAccessToken({ email });
            const refreshToken = await issueRefreshToken({ email });

            res.json({
                email,
                accessToken,
                refreshToken,
            });
        } catch (error) {
            res.json({ msg: `Error while creating new user` });
        }
    }
);

export default router;
