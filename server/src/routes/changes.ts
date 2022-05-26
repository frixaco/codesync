// SEND CHANGES, SAVE CHANGES, CLEAN CHANGES
import { Router } from "express";
import db from "../db";
import authMdw from "../middleware/auth";

const router = Router();

router.get("/", authMdw, async (req, res) => {
    try {
        const { deviceId } = req.body;

        const userId = 1; // JSONWEBTOKEN
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) throw new Error("No user found");

        const changes = await db.change.findMany({
            where: {
                ownerId: user.id,
                deviceId,
            },
            take: 1,
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({ diff: JSON.parse(changes[0].changes) });
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong in the server!" });
    }
});

router.post("/", authMdw, async (req, res) => {
    try {
        const { diff, deviceId } = req.body;

        const userId = 1; // JSONWEBTOKEN
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) throw new Error("User not found");

        await db.change.create({
            data: {
                changes: JSON.stringify(diff),
                ownerId: userId,
                deviceId: deviceId,
            },
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ msg: "Something went wrong in the server!" });
    }
});

export default router;
