import { Router } from "express";
import db from "../db";
import authMdw from "../middleware/auth";

const router = Router();

router.post("/", authMdw, async (req, res) => {
    try {
        const userId = 1; // JSONWEBTOKEN
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) throw new Error("User not found");

        const { name } = req.body;

        const devices = await db.device.create({
            data: {
                owner: {
                    connect: { id: user.id },
                },
                name,
            },
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong in the server!" });
    }
});

router.get("/", authMdw, async (req, res) => {
    try {
        const userId = 1; // JSONWEBTOKEN
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) throw new Error("User not found");

        const devices = await db.device.findMany({
            where: {
                ownerId: user.id,
            },
        });

        res.json({ devices });
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong in the server!" });
    }
});

export default router;
