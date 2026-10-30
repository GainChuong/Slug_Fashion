const express = require('express');
const app = express();
const port = 3002;

const morgan=require("morgan")
app.use(morgan("combined"))

const path=require("path")
const fs = require('fs');
const crypto = require('crypto');
app.use(express.static(path.join(__dirname,"public")))

const cors=require("cors")
//app.use(cors())
app.use(cors({
    origin: 'http://localhost:4200', 
    credentials: true
}));
const bodyParser=require("body-parser")
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.listen(port,()=>{
    console.log(`My Server listening on port ${port}`)
})

app.get("/",(req,res)=>{
    res.send("This Web server is processed for MongoDB")
})
const { MongoClient, ObjectId } = require('mongodb');
const { log } = require('console');
client = new MongoClient("mongodb://127.0.0.1:27017");
client.connect();
database = client.db("FashionData");      
fashionCollection = database.collection("Fashion");

const requireBearerAuth = async (req, res, next) => {
    const tokenMatch = req.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_-]+)$/);
    if (!tokenMatch) {
        return res.status(401).send({ message: "Bearer token is required." });
    }

    const tokenHash = crypto.createHash('sha256').update(tokenMatch[1]).digest('hex');
    const session = await database.collection("UserSessions").findOne({
        tokenHash,
        expiresAt: { $gt: new Date() }
    });
    if (!session) {
        return res.status(401).send({ message: "Bearer token is invalid or expired." });
    }
    return next();
};

// Tự động kiểm tra và gán IdF (số nguyên duy nhất không trùng) cho các Fashion chưa có IdF
async function initFashionIndexesAndIdF() {
    try {
        const existingWithoutIdF = await fashionCollection.find({
            $or: [{ IdF: { $exists: false } }, { IdF: null }]
        }).toArray();

        if (existingWithoutIdF.length > 0) {
            const maxDoc = await fashionCollection.find({ IdF: { $type: "number" } })
                .sort({ IdF: -1 })
                .limit(1)
                .toArray();
            let currentMax = maxDoc.length > 0 && typeof maxDoc[0].IdF === 'number' ? maxDoc[0].IdF : 0;
            for (const item of existingWithoutIdF) {
                currentMax += 1;
                await fashionCollection.updateOne({ _id: item._id }, { $set: { IdF: currentMax } });
            }
            console.log(`Auto assigned unique IdF to ${existingWithoutIdF.length} fashion records.`);
        }
    } catch (err) {
        console.error("Error migrating IdF:", err);
    }
}
initFashionIndexesAndIdF();

app.get("/fashions", cors(), async (req, res) => {
    try {
        const { style } = req.query;
        const query = style ? { style: style } : {};
        const result = await fashionCollection.find(query).sort({ created_at: -1, _id: -1 }).toArray();
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/fashions/styles/all", cors(), async (req, res) => {
    try {
        const styles = await fashionCollection.distinct("style");
        res.send(styles.filter(Boolean));
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/fashions/:id", cors(), async (req, res) => {
    try {
        const id = req.params["id"];
        if (!id) return res.status(400).send({ error: "Missing identifier" });

        let item = null;

        // 1. Nếu là MongoDB ObjectId hợp lệ
        if (ObjectId.isValid(id) && id.length === 24) {
            item = await fashionCollection.findOne({ _id: new ObjectId(id) });
        }

        // 2. Nếu là số thuần túy (IdF ví dụ /fashions/1)
        if (!item && !isNaN(Number(id))) {
            const numId = parseInt(id, 10);
            item = await fashionCollection.findOne({ IdF: numId });
        }

        // 3. Nếu là Slug dạng ten-san-pham-p{IdF}
        if (!item) {
            const matchSlug = id.match(/-p(\d+)$/);
            if (matchSlug) {
                const parsedIdF = parseInt(matchSlug[1], 10);
                item = await fashionCollection.findOne({ IdF: parsedIdF });
            }
        }

        // 4. Tìm kiếm tương đối theo subject hoặc slug
        if (!item) {
            item = await fashionCollection.findOne({
                fashion_subject: { $regex: new RegExp(id.replace(/-/g, ' '), 'i') }
            });
        }

        if (!item) {
            return res.status(404).send({ error: "Fashion not found" });
        }
        res.send(item);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post("/fashions", cors(), requireBearerAuth, async (req, res) => {
    try {
        // Tìm IdF lớn nhất hiện có để tự động tăng 1, đảm bảo không trùng
        const maxDoc = await fashionCollection.find({ IdF: { $type: "number" } })
            .sort({ IdF: -1 })
            .limit(1)
            .toArray();
        const nextIdF = maxDoc.length > 0 && typeof maxDoc[0].IdF === 'number' ? maxDoc[0].IdF + 1 : 1;

        const newFashion = {
            ...req.body,
            IdF: req.body.IdF ? Number(req.body.IdF) : nextIdF,
            created_at: req.body.created_at ? new Date(req.body.created_at) : new Date()
        };

        const result = await fashionCollection.insertOne(newFashion);
        res.send({ ...newFashion, _id: result.insertedId });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put("/fashions", cors(), requireBearerAuth, async (req, res) => {
    try {
        if (!req.body._id || !ObjectId.isValid(req.body._id)) {
            return res.status(400).send({ error: "Invalid _id" });
        }
        const o_id = new ObjectId(req.body._id);
        const updateFields = {
            style: req.body.style,
            fashion_subject: req.body.fashion_subject,
            fashion_detail: req.body.fashion_detail,
            fashion_image: req.body.fashion_image
        };
        if (req.body.IdF !== undefined && !isNaN(Number(req.body.IdF))) {
            updateFields.IdF = Number(req.body.IdF);
        }

        await fashionCollection.updateOne(
            { _id: o_id },
            { $set: updateFields }
        );
        const result = await fashionCollection.findOne({ _id: o_id });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete("/fashions/:id", cors(), requireBearerAuth, async (req, res) => {
    try {
        const id = req.params["id"];
        let filter = null;
        if (ObjectId.isValid(id) && id.length === 24) {
            filter = { _id: new ObjectId(id) };
        } else if (!isNaN(Number(id))) {
            filter = { IdF: parseInt(id, 10) };
        }

        if (!filter) {
            return res.status(400).send({ error: "Invalid ID" });
        }

        const item = await fashionCollection.findOne(filter);
        if (!item) {
            return res.status(404).send({ error: "Fashion not found" });
        }
        await fashionCollection.deleteOne(filter);
        res.send(item);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});
app.post('/user-login', async (req, res) => {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
        return res.status(400).send({ message: "Username and password are required." });
    }

    const UserCollection = database.collection("User");
    const user = await UserCollection.findOne({ username });
    const safeEqual = (value, expected) => {
        if (typeof value !== 'string' || typeof expected !== 'string') {
            return false;
        }
        const valueBuffer = Buffer.from(value);
        const expectedBuffer = Buffer.from(expected);
        return valueBuffer.length === expectedBuffer.length &&
            crypto.timingSafeEqual(valueBuffer, expectedBuffer);
    };

    let isValid = false;
    if (user?.passwordHash && user?.passwordSalt) {
        const passwordHash = crypto
            .createHash('sha256')
            .update(`${user.passwordSalt}:${password}`)
            .digest('hex');
        isValid = safeEqual(passwordHash, user.passwordHash);
    } else if (typeof user?.password === 'string') {
        isValid = safeEqual(password, user.password);
        if (isValid) {
            const passwordSalt = crypto.randomBytes(16).toString('hex');
            const passwordHash = crypto
                .createHash('sha256')
                .update(`${passwordSalt}:${password}`)
                .digest('hex');
            await UserCollection.updateOne(
                { _id: user._id },
                {
                    $set: { passwordHash, passwordSalt },
                    $unset: { password: "" }
                }
            );
        }
    }

    if (!user || !isValid) {
        return res.status(401).send({ message: "Wrong user or email!" });
    }

    const accessToken = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    await database.collection("UserSessions").insertOne({
        userId: user._id,
        tokenHash: crypto.createHash('sha256').update(accessToken).digest('hex'),
        expiresAt
    });
    res.status(200).send({
        message: "Login successful!",
        user: { username: user.username, role: user.role },
        accessToken,
        tokenType: "Bearer",
        expiresAt
    });
});

app.get('/user-session', async (req, res) => {
    const authorization = req.get('Authorization');
    const tokenMatch = authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/);
    if (!tokenMatch) {
        return res.status(401).send({ message: "Bearer token is required." });
    }

    const tokenHash = crypto.createHash('sha256').update(tokenMatch[1]).digest('hex');
    const session = await database.collection("UserSessions").findOne({
        tokenHash,
        expiresAt: { $gt: new Date() }
    });
    if (!session) {
        return res.status(401).send({ message: "Bearer token is invalid or expired." });
    }

    const user = await database.collection("User").findOne(
        { _id: session.userId },
        { projection: { username: 1, role: 1 } }
    );
    if (!user) {
        return res.status(401).send({ message: "Session user no longer exists." });
    }
    return res.status(200).send({
        user: { username: user.username, role: user.role }
    });
});

app.post('/user-logout', async (req, res) => {
    const authorization = req.get('Authorization');
    const tokenMatch = authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/);
    if (tokenMatch) {
        const tokenHash = crypto.createHash('sha256').update(tokenMatch[1]).digest('hex');
        await database.collection("UserSessions").deleteOne({ tokenHash });
    }
    return res.status(204).send();
});
