const Express = require("express");
const { connectDB, closeDB } = require("../connect.ts");
const router = Express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("users");
    const result = await collection.find({}).toArray();
    await closeDB();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/:user/register", async (req, res) => {
  try {
    const userType = req.params.user;
    if (userType !== "doctors" && userType !== "patients")
      return res.status(400).send("Invalid user type");
    const db = await connectDB();
    const collection = db.collection(userType);
    await collection.insertOne(req.body);
    await closeDB();
    res.json("Account created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/login/:user", async (req, res) => {
  try {
    const userType = req.params.user;
    if (userType !== "doctors" && userType !== "patients")
      return res.status(400).send("Invalid user type");
    const db = await connectDB();
    const collection = db.collection(userType);
    const result = await collection.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    await closeDB();
    if (!result) return res.status(401).send("Invalid email or password");
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
