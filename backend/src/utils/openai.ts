import OpenAI from "openai";
import { getDB } from "./connect";
import { ObjectId } from "mongodb";
import moment from "moment";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from "../routes/appointments";
import { createNotification } from "../routes/notifications";
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI,
});

async function runAssistant(
  threadId: string,
  question: string,
  doctorId?: string
) {
  let run = null;
  try {
    const todayMessage =
      " Todays date and time is " + moment().format("YYYY-MM-DD hh:mm A");
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: question + todayMessage,
      metadata: {
        today: todayMessage,
      },
    });
    const db = await getDB();
    const doctors = db.collection("doctors");
    const doctorInfo = await doctors.findOne({ _id: new ObjectId(doctorId) });
    run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_OXKvz1P7b3RhmadMUbBiz75V",
      additional_instructions:
        "The doctors info is: " + JSON.stringify(doctorInfo),
    });

    let runStatus;
    while (true) {
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      // If assistant calls a function (tool), handle it
      if (runStatus.status === "requires_action") {
        const toolCalls =
          runStatus.required_action.submit_tool_outputs.tool_calls;

        const toolOutputs = await Promise.all(
          toolCalls.map(async (toolCall: any) => {
            const { name, arguments: args } = toolCall.function;
            let result;

            console.log(`Handling tool call: ${name} with args: ${args}`);
            // Handle specific function call
            if (name === "getAppointments") {
              // result = await getAppointments(JSON.parse(args));
              const params = JSON.parse(args);
              result = await getAppointments(params?.doctorId, params?.date);
            } else if (name === "createAppointment") {
              const params = JSON.parse(args);
              params.duration = doctorInfo.appointmentDuration;
              params.doctorId = doctorInfo._id.toString();
              result = await createAppointment(params?.doctorId, params);
            } else if (name === "updateAppointment") {
              const params = JSON.parse(args);
              params.duration = doctorInfo.appointmentDuration;
              result = await updateAppointment(params?.doctorId, params);
            } else if (name === "deleteAppointment") {
              const params = JSON.parse(args);
              result = await deleteAppointment(
                params.doctorId,
                params.appointmentId
              );
            } else if (name === "createNotification") {
              const params = JSON.parse(args);
              result = await createNotification(params);
            } else {
              result = `No handler for function: ${name}`;
            }

            return {
              tool_call_id: toolCall.id,
              output: JSON.stringify(result),
            };
          })
        );

        // Submit tool outputs to assistant
        await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
          tool_outputs: toolOutputs,
        });

        // Continue loop to re-check status
        continue;
      }
      if (runStatus.status === "completed") break;
      if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
        throw new Error(`Run failed: ${runStatus.status}`);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Step 5: Fetch messages from the thread
    const messages = await openai.beta.threads.messages.list(threadId);
    const response = messages.data.map((msg: any) => {
      let content = msg.content[0]?.text.value;
      if (msg.metadata && msg.metadata.today) {
        content = content.replace(msg.metadata.today, "");
      }
      return {
        role: msg.role,
        content: content,
        created_at: msg.created_at,
        id: msg.id,
      };
    });

    return response;
  } catch (error) {
    console.error("Error running assistant:", error);
    if (run) {
      await openai.beta.threads.runs.cancel(threadId, run.id);
    }
    throw error;
  }
}

async function getAssistantMessages(threadId: string) {
  try {
    const messages = await openai.beta.threads.messages.list(threadId);
    const response = messages.data.map((msg: any) => {
      let content = msg.content[0]?.text.value;
      if (msg.metadata && msg.metadata.today) {
        content = content.replace(msg.metadata.today, "");
      }
      return {
        role: msg.role,
        content: content,
        created_at: msg.created_at,
        id: msg.id,
      };
    });
    return response;
  } catch (error) {
    console.error("Error fetching assistant messages:", error);
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

const createThreadId = async (doctorId: string) => {
  try {
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;

    const db = await getDB();
    const doctors = db.collection("doctors");
    await doctors.updateOne(
      { _id: new ObjectId(doctorId) },
      { $set: { assistantThread: threadId } }
    );

    return threadId;
  } catch (error) {
    console.error("Error creating thread ID:", error);
  }
};

const deleteThread = async (threadId: string) => {
  try {
    await openai.beta.threads.del(threadId);
    const db = await getDB();
    const doctors = db.collection("doctors");
    await doctors.updateOne(
      { assistantThread: threadId },
      { $unset: { assistantThread: "" } }
    );
  } catch (error) {
    console.error("Error deleting thread:", error);
  }
};

export {
  runAssistant,
  runCompletion,
  getAssistantMessages,
  createThreadId,
  deleteThread,
};
