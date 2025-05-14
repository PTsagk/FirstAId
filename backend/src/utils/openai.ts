import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI, // This is the default and can be omitted
});

async function runAssistant() {
  try {
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: "Hello! What’s the weather like in Tokyo today?",
    });

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_OXKvz1P7b3RhmadMUbBiz75V",
    });

    let runStatus;
    while (true) {
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      if (runStatus.status === "completed") break;
      if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
        throw new Error(`Run failed: ${runStatus.status}`);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Step 5: Fetch messages from the thread
    const messages = await openai.beta.threads.messages.list(threadId);

    return messages;
  } catch (error) {
    console.error("Error running assistant:", error);
  }
}

async function runCompletion(question: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "o3-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpfull assistant that helps the doctor of a hospital to manage his appointments
           and give tips to the patients about their next appointment, how to get their medication and how to prepare
            for their upcoming appointment.`,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });
    return response;
  } catch (error) {
    console.error("Error running completion:", error);
  }
}

export { runAssistant, runCompletion };
