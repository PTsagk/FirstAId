import emailjs from "@emailjs/nodejs";
import { getDB } from "./connect";
import { runCompletion } from "./openai";
import { createNotification } from "../routes/notifications";
const moment = require("moment");

const sendEmail = async (
  templateID: string = "template_4ow7iii",
  to: string,
  messageInfo: any
) => {
  if (process.env.NODE_ENV === "development") return;
  try {
    let templateParams: any = {
      notes: "Check this out!",
      doctor_email: "test@gmail.com",
      patient_email: to,
    };

    // if (
    //   templateID === "template_4ow7iii" ||
    //   templateID === "template_4ow7iii"
    // ) {
    //   templateParams.fullname = messageInfo.fullname;
    //   templateParams.date = messageInfo.date;
    //   templateParams.time = messageInfo.time;
    // }

    Object.keys(messageInfo).forEach((key) => {
      templateParams[key] = messageInfo[key];
    });

    return await emailjs.send("service_3puhk9w", templateID, templateParams, {
      publicKey: "_bc0qPeLQZLJ3DeuM",
      privateKey: "ARbnjIaTJU-t3Tu-uoe2d", // optional, highly recommended for security reasons
    });
  } catch (error) {
    console.error(error);
  }
};
async function sendReminderEmail(emailData) {
  try {
    if (
      !moment(emailData.date + emailData.time)
        .add(1, "hours")
        .isBefore(moment())
    ) {
      await sendEmail("template_4ow7iii", emailData.to, {
        fullname: emailData.fullname,
        message: `This is a reminder for your appointment on ${emailData.date} at ${emailData.time}.`,
        to: emailData.to,
        from: emailData.from,
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error sending scheduled emails:", error);
  }
}

async function sendNotificationEmail(emailData) {
  try {
    if (!moment(emailData.date + emailData.time).isBefore(moment())) {
      emailData.sent = true;
      const gptResponse = await runCompletion(
        `The doctor want's to comminicate with the patient for the following reason:
          ${emailData.messageReason}.
          You are given the doctor notes and the patients notes for an upcoming appointment.
          Give some  helpfull information to the patient.
          Doctor notes: ${emailData.doctorNotes} \nPatient notes: ${emailData.patientNotes}`
      );
      const db = await getDB();

      const messagesCollection = db.collection("messages");

      const existingMessageDoc = await messagesCollection.findOne({
        appointmentId: emailData.appointmentId,
      });

      const newMessage = {
        date: emailData.date,
        time: emailData.time,
        to: emailData.to,
        fullname: emailData.fullname,
        message: gptResponse.choices[0].message.content,
        userType: "doctor",
      };

      if (existingMessageDoc) {
        await messagesCollection.updateOne(
          { appointmentId: emailData.appointmentId },
          { $push: { messages: newMessage } }
        );
      } else {
        await messagesCollection.insertOne({
          appointmentId: emailData.appointmentId,
          messages: [newMessage],
        });
      }

      // Send the email with the generated content
      await sendEmail("template_4ow7iii", emailData.to, {
        fullname: emailData.fullname,
        message: gptResponse.choices[0].message.content,
        to: emailData.to,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error sending scheduled emails:", error);
  }
}

async function sendFollowUpEmail(emailData) {
  try {
    await sendEmail("template_4ow7iii", emailData.to, {
      fullname: emailData.fullname,
      message: emailData.message,
      to: emailData.to,
    });
    if (emailData.userType == "doctor") {
      const db = await getDB();
      const messagesCollection = db.collection("messages");
      const existingMessageDoc = await messagesCollection.findOne({
        appointmentId: emailData.appointmentId,
      });

      const newMessage = {
        date: emailData.date,
        time: emailData.time,
        to: emailData.to,
        fullname: emailData.fullname,
        message: emailData.messageReason,
        userType: "doctor",
      };

      if (existingMessageDoc) {
        await messagesCollection.updateOne(
          { appointmentId: emailData.appointmentId },
          { $push: { messages: newMessage } }
        );
      } else {
        await messagesCollection.insertOne({
          appointmentId: emailData.appointmentId,
          messages: [newMessage],
        });
      }
      createNotification({
        message: "You have a new message from  " + emailData.fullname,
        sent: false,
        userId: emailData.patientId,
        createdAt: moment().format("YYYY-MM-DD HH:mm"),
      });
    }
    return true;
  } catch (error) {
    console.error("Error sending follow-up emails:", error);
  }
}
export {
  sendEmail,
  sendReminderEmail,
  sendNotificationEmail,
  sendFollowUpEmail,
};
