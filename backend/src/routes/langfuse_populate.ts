import { Request, Response } from "express";
import Express from "express";
const router = Express.Router();
import { generateDoctorAdvice, generateMessage } from "../populate_langfuse";
import fs from "fs";
import path from "path";
router.get("/advisor", async (req: Request, res: Response) => {
  try {
    const testDataPath = path.join(__dirname, "../../src/conversation.json");
    const jsonData = await fs.promises.readFile(testDataPath, "utf8");
    const testCases = JSON.parse(jsonData);

    // Loop through each test case
    for (const [index, testCase] of testCases.entries()) {
      await generateDoctorAdvice(testCase.input);
      console.log(`Processed ${index}: ${testCase.input}`);
      if (index >= 1000) break;
    }

    res.json({ message: "All test cases processed", count: testCases.length });
  } catch (error) {
    console.error("Error populating Langfuse:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/mesage-drafting", async (req: Request, res: Response) => {
  try {
    const testDataPath = path.join(__dirname, "../../src/disease.json");
    const jsonData = await fs.promises.readFile(testDataPath, "utf8");
    const testCases = JSON.parse(jsonData);
    const uniqueDiseases = Array.from(
      new Set(testCases.map((testCase: any) => testCase.disease))
    ).map((disease) => ({ disease }));
    uniqueDiseases.splice(0, 571);
    // Loop through each test case
    let index = 571;
    for (const testCase of uniqueDiseases) {
      await generateMessage(testCase.disease);
      console.log(`Processed ${index}: ${testCase.disease}`);
      index++;
      if (index >= 1000) break;
    }

    res.json({
      message: "All test cases processed",
      count: uniqueDiseases.length,
    });
  } catch (error) {
    console.error("Error populating Langfuse:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
export default router;
