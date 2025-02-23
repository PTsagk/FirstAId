const Express = require("express");
const { connectDB, closeDB } = require("../connect");
const bcrypt = require("bcrypt");
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = { ...req.body, password: hashedPassword };
    await collection.insertOne(user);
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
    const user = await collection.findOne({ email: req.body.email });
    await closeDB();
    if (!user) return res.status(401).send("Invalid email or password");
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) return res.status(401).send("Invalid email or password");
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
