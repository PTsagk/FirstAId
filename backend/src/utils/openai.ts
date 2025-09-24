import OpenAI from "openai";
import { observeOpenAI } from "@langfuse/openai";
import { getDB } from "./connect";
import { ObjectId } from "mongodb";
import moment from "moment";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  getAvailableHours,
  getPreviousAppointments,
  updateAppointment,
} from "../routes/appointments";
import {
  createEmailNotification,
  createFollowUpNotification,
} from "../routes/notifications";
import { startObservation } from "@langfuse/tracing";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI,
});

async function runDoctorAssistant(
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

    const trace = startObservation("Patient Assistant", {
      input: { question },
    });
    const db = await getDB();
    const doctors = db.collection("doctors");
    const doctorInfo = await doctors.findOne({ _id: new ObjectId(doctorId) });
    run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_OXKvz1P7b3RhmadMUbBiz75V",
      additional_instructions:
        "The doctors info is: " +
        JSON.stringify(doctorInfo) +
        "The doctors appointments are: " +
        JSON.stringify(await getAppointments(doctorId, null, true)) +
        todayMessage,
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
            const params = JSON.parse(args);
            params.doctorId = doctorInfo._id.toString();
            console.log(`Handling tool call: ${name} with args: ${args}`);
            // Handle specific function call
            if (name === "getAppointments") {
              // result = await getAppointments(JSON.parse(args));
              result = await getAppointments(
                params?.doctorId,
                params?.date,
                true
              );
            } else if (name === "createAppointment") {
              params.duration = doctorInfo.appointmentDuration;
              result = await createAppointment(params?.doctorId, params, true);
            } else if (name === "updateAppointment") {
              params.duration = doctorInfo.appointmentDuration;
              result = await updateAppointment(params?.doctorId, params, true);
            } else if (name === "deleteAppointment") {
              result = await deleteAppointment(
                params.doctorId,
                params.appointmentId
              );
            } else if (name === "sendMessage") {
              params.doctorId = doctorId;
              result = await createEmailNotification(params);
            } else {
              result = `No handler for function: ${name}`;
            }
            const toolSpan = trace.startObservation(
              name,
              {
                input: { param: args },
              },
              { asType: "tool" }
            );
            toolSpan.update({ output: { result: result } });
            toolSpan.end();
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
      if (msg.role === "assistant") content = JSON.parse(content);
      if (msg.metadata && msg.metadata.today) {
        if (msg.role === "assistant") {
          content.message_text = content.message_text.replace(
            msg.metadata.today,
            ""
          );
        } else if (msg.role === "user") {
          content = content.replace(msg.metadata.today, "");
        }
      }
      return {
        role: msg.role,
        content: content,
        created_at: msg.created_at,
        id: msg.id,
      };
    });
    trace.update({
      output: {
        result: response[0]?.content?.message_text,
      },
    });
    trace.end();
    return response;
  } catch (error) {
    console.error("Error running assistant:", error);
    if (run) {
      await openai.beta.threads.runs.cancel(threadId, run.id);
    }
    throw error;
  }
}

async function runPatientAssistant(
  threadId: string,
  question: string,
  patientId?: string,
  doctorId?: string
) {
  let run = null;
  try {
    const todayMessage =
      " Todays date and time is " + moment().format("YYYY-MM-DD hh:mm A");
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: question,
      metadata: {
        today: todayMessage,
      },
    });
    const trace = startObservation("Patient Assistant", {
      input: { question },
    });
    const db = await getDB();
    const doctors = db.collection("doctors");
    const patients = db.collection("patients");
    const patientAppointments = await db
      .collection("appointments")
      .find({ patientId: patientId, doctorId: doctorId })
      .toArray();
    const doctorInfo = await doctors.findOne({ _id: new ObjectId(doctorId) });
    const patientInfo = await patients.findOne({
      _id: new ObjectId(patientId),
    });
    run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_YhszAb0grob0xcPbgF56r3Xm",
      additional_instructions:
        "The doctors info is: " +
        JSON.stringify(doctorInfo) +
        ". The patients info are: " +
        JSON.stringify({ patientInfo }) +
        ". The patients previous/coming appointments are: " +
        JSON.stringify(patientAppointments) +
        ". " +
        todayMessage,
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
              result = await getAvailableHours(
                doctorId,
                params?.date,
                params?.severity
              );
              result =
                `The available hours for appointments for the date ${params?.date} are: ` +
                JSON.stringify(result);
            } else if (name === "createAppointment") {
              const params = JSON.parse(args);
              params.duration = doctorInfo.appointmentDuration;
              params.patientId = patientId;
              result = await createAppointment(doctorId, params, true);
              result = JSON.stringify(result);
            } else if (name === "updateAppointment") {
              const params = JSON.parse(args);
              params.duration = doctorInfo.appointmentDuration;
              result = await updateAppointment(doctorId, params, true);
              result = JSON.stringify(result);
            } else if (name === "deleteAppointment") {
              const params = JSON.parse(args);
              result = await deleteAppointment(doctorId, params.appointmentId);
              result = JSON.stringify(result);
            } else if (name === "createNotification") {
              const params = JSON.parse(args);
              result = await createEmailNotification(params);
            } else if (name === "followUpMessage") {
              const params = JSON.parse(args);
              params.patientId = patientId;
              result = await createFollowUpNotification(params);
            } else if (name === "getPreviousAppointments") {
              result = await getPreviousAppointments(patientInfo.email);
            } else {
              result = `No handler for function: ${name}`;
            }
            const toolSpan = trace.startObservation(
              name,
              {
                input: { param: args },
              },
              { asType: "tool" }
            );
            toolSpan.update({ output: { result: result } });
            toolSpan.end();
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
      if (runStatus.status === "completed") {
        const activeRuns = await getActiveRuns(threadId);
        if (activeRuns.length > 0) {
          runStatus = await openai.beta.threads.runs.retrieve(
            threadId,
            activeRuns[0].id
          );
        }
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Step 5: Fetch messages from the thread
    const messages = await openai.beta.threads.messages.list(threadId);
    const response = messages.data.map((msg: any) => {
      let content = msg.content[0]?.text.value;
      try {
        if (msg.role === "assistant") content = JSON.parse(content);
      } catch (e) {
        // If content is not JSON, keep it as is
        console.error("Failed to parse content as JSON:", e);
      }
      if (msg.metadata && msg.metadata.today) {
        if (msg.role === "assistant") {
          content.message_text = content.message_text.replace(
            msg.metadata.today,
            ""
          );
        } else if (msg.role === "user") {
          content = content.replace(msg.metadata.today, "");
        }
      }
      return {
        role: msg.role,
        content: content,
        created_at: msg.created_at,
        id: msg.id,
      };
    });
    trace.update({
      output: { result: response[0].content.message_text },
    });
    trace.end();

    return response;
  } catch (error) {
    console.error("Error running assistant:", error);
    if (run) {
      await openai.beta.threads.runs.cancel(threadId, run.id);
    }
    throw error;
  }
}

async function getActiveRuns(threadId) {
  try {
    const runs = await openai.beta.threads.runs.list(threadId);

    const activeRuns = runs.data.filter((run) =>
      ["queued", "in_progress", "requires_action"].includes(run.status)
    );

    activeRuns.forEach((run) => {
      console.log(`Run ID: ${run.id}, Status: ${run.status}`);
    });

    return activeRuns;
  } catch (error) {
    console.error("Error fetching runs:", error);
  }
}
async function getAssistantMessages(threadId: string) {
  try {
    const messages = await openai.beta.threads.messages.list(threadId);
    const response = messages.data.map((msg: any) => {
      let content = msg.content[0]?.text.value;
      if (msg.role === "assistant") content = JSON.parse(content);

      if (msg.metadata && msg.metadata.today) {
        if (msg.role === "assistant") {
          content.message_text = content.message_text.replace(
            msg.metadata.today,
            ""
          );
        } else if (msg.role === "user") {
          content = content.replace(msg.metadata.today, "");
        }
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
    const response = await observeOpenAI(openai, {
      generationName: "completion",
      tags: ["backend"],
    }).chat.completions.create({
      model: "o3-mini",
      messages: [
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

const createThreadId = async () => {
  try {
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;
    return threadId;
  } catch (error) {
    console.error("Error creating thread ID:", error);
  }
};

const deleteThread = async (threadId: string) => {
  try {
    await openai.beta.threads.del(threadId);
  } catch (error) {
    console.error("Error deleting thread:", error);
  }
};

const createConversation = async (
  messages: any[],
  info: any,
  question: string
) => {
  try {
    messages.push({
      role: "system",
      content: `You are an AI doctor Advisor doctor is usring during their appointments to exam the patients and provide recommendations based on their medical history. 
      You help the doctors find relevant information quickly and efficiently taking into consideration the FHIR rules. 
      Here is the doctor's question: ${question}
      You are given the following information about the appointment, the patient and the doctor: ${JSON.stringify(
        info
      )}
      The response format should be a JSON object with the following structure:
      {
        "text": "The assistant's response text",
        "updatePrescription": "The name of the prescription that the doctor requested"
      }
      `,
    });
    openai.chat.completions.list();

    const response = await observeOpenAI(openai, {
      generationName: "healthcare-assistant",
      tags: ["backend"],
    }).chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messages,
      response_format: {
        type: "json_object",
      },
    });
    const chatResponse = JSON.parse(response.choices[0].message.content);
    return chatResponse;
  } catch (error) {
    console.error("Error creating conversation:", error);
  }
};

export {
  runDoctorAssistant,
  runPatientAssistant,
  runCompletion,
  getAssistantMessages,
  createThreadId,
  deleteThread,
  createConversation,
};
