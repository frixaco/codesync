import db from "./db";

export async function login(req: any, res: any) {
    try {
        // const { email, password, accessToken, refreshToken } = req.body;
        // const isUserExists = await db.user.findUnique({
        //     where: {
        //         email,
        //     },
        // });
        // if (isUserExists) {
        //     res.json({ msg: `User already exists` });
        // }
        // const parsedAccessToken = await verifyAccessToken(accessToken);
        // const parsedRefreshToken = await verifyRefreshToken(refreshToken);
        // if (parsedAccessToken && email === parsedAccessToken.email) {
        //     res.json({
        //         accessToken,
        //         refreshToken,
        //         email,
        //     });
        // }
        // res.json({
        //     email,
        //     accessToken: token,
        //     refreshToken: user.refreshToken,
        // });
    } catch (error) {
        res.status(500).json({ msg: "Login error" });
    }
}

export async function signup(req: any, res: any) {
    try {
        // const { email, password } = req.body;
        // const isUserExists = await db.user.findUnique({
        //     where: {
        //         email,
        //     },
        // });
        // if (isUserExists) {
        //     return res.json({ msg: `User with ${email} already exists.` });
        // }
        // await db.user.create({
        //     data: {
        //         email,
        //         password,
        //     },
        // });
        // const accessToken = await issueAccessToken({ email });
        // const refreshToken = await issueRefreshToken({ email });
        // res.json({
        //     email,
        //     accessToken,
        //     refreshToken,
        // });
    } catch (error) {
        res.json({ msg: `Error while creating new user` });
    }
}
