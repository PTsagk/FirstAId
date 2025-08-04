import emailjs from "@emailjs/nodejs";
import { getDB } from "./connect";
import { ObjectId } from "mongodb";
import { runCompletion } from "./openai";
const moment = require("moment");

const sendEmail = async (
  templateID: string = "template_asoqqkh",
  to: string,
  messageInfo: any
) => {
  try {
    let templateParams: any = {
      notes: "Check this out!",
      doctor_email: "test@gmail.com",
      patient_email: to,
    };

    // if (
    //   templateID === "template_asoqqkh" ||
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
async function sendReminderEmails() {
  try {
    const db = await getDB();
    const collection = db.collection("reminder_emails");
    const emailsToSend = await collection
      .find({
        date: moment().format("YYYY-MM-DD"),
      })
      .toArray();

    for (const emailData of emailsToSend) {
      if (
        !moment(emailData.date + emailData.time)
          .add(1, "hours")
          .isBefore(moment())
      ) {
        emailData.sent = true;
        await sendEmail("template_4ow7iii", emailData.to, {
          fullname: emailData.fullname,
          date: emailData.date,
          time: emailData.time,
        });
      } else {
        emailData.sent = false;
      }
    }
    const sendedEmails = emailsToSend.filter(
      (emailData) => emailData.sent === true
    );
    if (sendedEmails.length > 0) {
      await collection.deleteMany({
        _id: {
          $in: sendedEmails.map((emailData) => new ObjectId(emailData._id)),
        },
      });
    }
  } catch (error) {
    console.error("Error sending scheduled emails:", error);
  }
}

async function sendNotificationEmails() {
  try {
    const db = await getDB();
    const collection = db.collection("notification_emails");
    const emailsToSend = await collection.find({}).toArray();

    for (const emailData of emailsToSend) {
      if (!moment(emailData.date + emailData.time).isBefore(moment())) {
        emailData.sent = true;
        const gptResponse = await runCompletion(
          `The doctor want's to comminicate with the patient for the following reason:
          ${emailData.messageReason}.
          You are given the doctor notes and the patients notes for an upcoming appointment.
          Give some  helpfull information to the patient.
          Doctor notes: ${emailData.doctorNotes} \nPatient notes: ${emailData.patientNotes}`
        );
        await sendEmail("template_4ow7iii", emailData.to, {
          fullname: emailData.fullname,
          date: emailData.date,
          time: emailData.time,
          assistant: gptResponse.choices[0].message.content,
        });
      } else emailData.sent = false;
    }
    await collection.deleteMany({
      _id: {
        $in: emailsToSend.map((emailData) => new ObjectId(emailData._id)),
      },
    });
  } catch (error) {
    console.error("Error sending scheduled emails:", error);
  }
}

async function sendFollowUpEmails() {
  try {
    const db = await getDB();
    const collection = db.collection("follow_up_emails");
    const emailsToSend = await collection.find({}).toArray();

    for (const emailData of emailsToSend) {
      await sendEmail("template_follow_up", emailData.to, {
        fullname: emailData.fullname,
        date: emailData.date,
        time: emailData.time,
        message: emailData.message,
      });
    }

    await collection.deleteMany({
      _id: {
        $in: emailsToSend.map((emailData) => new ObjectId(emailData._id)),
      },
    });
  } catch (error) {
    console.error("Error sending follow-up emails:", error);
  }
}
export {
  sendEmail,
  sendReminderEmails,
  sendNotificationEmails,
  sendFollowUpEmails,
};
