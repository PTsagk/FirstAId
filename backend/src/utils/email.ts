import emailjs from "@emailjs/nodejs";
import { closeDB, connectDB } from "../connect";
import { ObjectId } from "mongodb";
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

    if (
      templateID === "template_asoqqkh" ||
      templateID === "template_4ow7iii"
    ) {
      templateParams.fullname = messageInfo.fullname;
      templateParams.date = messageInfo.date;
      templateParams.time = messageInfo.time;
    }

    return await emailjs.send("service_3puhk9w", templateID, templateParams, {
      publicKey: "_bc0qPeLQZLJ3DeuM",
      privateKey: "ARbnjIaTJU-t3Tu-uoe2d", // optional, highly recommended for security reasons
    });
  } catch (error) {
    console.error(error);
  }
};
async function sendScheduledEmails() {
  try {
    const db = await connectDB();
    const collection = db.collection("scheduledEmails");
    const emailsToSend = await collection
      .find({
        date: moment().format("YYYY-MM-DD"),
      })
      .toArray();

    for (const emailData of emailsToSend) {
      if (
        !moment(emailData.data + emailData.time)
          .add(1, "hours")
          .isBefore(moment())
      ) {
        emailData.sent = true;
        await sendEmail(
          "template_4ow7iii",
          emailData.to,
          "Appointment Reminder: " + emailData.date + " " + emailData.time
        );
      } else {
        emailData.sent = false;
      }
    }
    const sendedEmails = emailsToSend.filter(
      (emailData) => emailData.sent === true
    );
    if (sendedEmails.length > 0) {
      const collection = db.collection("scheduledEmails");
      await collection.deleteMany({
        _id: {
          $in: sendedEmails.map((emailData) => new ObjectId(emailData._id)),
        },
      });
    }
    await closeDB();
  } catch (error) {
    console.error("Error sending scheduled emails:", error);
  }
}

export { sendEmail, sendScheduledEmails };
