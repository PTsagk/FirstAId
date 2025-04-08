import emailjs from "@emailjs/nodejs";

const sendEmail = async (
  to: string,
  fullname: string,
  date: string,
  time: string
) => {
  try {
    const templateParams = {
      name: fullname,
      notes: "Check this out!",
      date: date,
      time: time,
      doctor_email: "test@gmail.com",
      patient_email: to,
    };

    return await emailjs.send(
      "service_3puhk9w",
      "template_asoqqkh",
      templateParams,
      {
        publicKey: "_bc0qPeLQZLJ3DeuM",
        privateKey: "ARbnjIaTJU-t3Tu-uoe2d", // optional, highly recommended for security reasons
      }
    );
  } catch (error) {
    console.error(error);
  }
};

export { sendEmail };
