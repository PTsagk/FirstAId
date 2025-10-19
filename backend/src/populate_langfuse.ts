import "./instrumentation";
import OpenAI from "openai";
import { startObservation } from "@langfuse/tracing";
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI,
});

const generateDoctorAdvice = async (patientDescription) => {
  try {
    const info = {
      patientNotes: patientDescription,
      patientInfo: {
        _id: "68e4256e64d19b4d9ab92921",
        name: "Nikos Mastoras",
        email: "nikosmast@gmail.com",
        telephone: 6976789345,
        city: "Sparti",
        address: "Parori",
        gender: "male",
        dateOfBirth: "2000-06-15T21:00:00.000Z",
        bloodType: "AB+",
        weight: 82,
        height: 185,
        medicalHistory: [
          {
            resourceType: "AllergyIntolerance",
            id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
            medicationCodeableConcept: {
              text: "Peanuts",
            },
            subject: {
              reference: "Nikos Mastoras",
            },
            authoredOn: "2025-10-06",
            requester: {
              reference: "Unknown",
            },
            reasonCode: [
              {
                coding: [
                  {
                    system: "http://hl7.org/fhir/sid/icd-10",
                    code: "Z91.010",
                    display: "Peanut allergy",
                  },
                ],
              },
            ],
            dosageInstruction: [
              {
                text: "No dosage applicable for an allergy.",
                timing: {
                  repeat: {
                    frequency: 0,
                    period: 0,
                    periodUnit: "",
                  },
                },
                doseAndRate: [
                  {
                    doseQuantity: {
                      value: 0,
                      unit: "",
                    },
                  },
                ],
              },
            ],
          },
          {
            humanText:
              "Patient Nikos Mastoras is advised to adopt a Mediterranean diet that emphasizes a balanced intake of fruits, vegetables, legumes, whole grains, and olive oil. This nutritional approach is supportive of overall cardiovascular and musculoskeletal health, which is crucial given the patient’s current condition. Extra caution should be exercised to avoid peanut-based products in light of the existing allergy.",
            resourceType: "CarePlan",
            id: "c56f79a8-0cde-4b9b-afbb-7abf9e3c89de",
            intent: "plan",
            subject: {
              reference: "Nikos Mastoras",
            },
            title: "Mediterranean Diet Plan",
            description:
              "A balanced Mediterranean diet designed to enhance overall health and support recovery while accounting for allergy restrictions.",
            created: "2025-10-07",
            author: {
              reference: "Peter Tsagkouris",
            },
            addresses: [
              {
                coding: [
                  {
                    system: "http://hl7.org/fhir/sid/icd-10",
                    code: "Z71.3",
                    display: "Dietary counseling and surveillance",
                  },
                ],
              },
            ],
            activity: [
              {
                detail: {
                  kind: "ServiceRequest",
                  code: {
                    coding: [
                      {
                        system: "http://hl7.org/fhir/sid/icd-10",
                        code: "Z13.220",
                        display: "Encounter for screening for lipoid disorders",
                      },
                    ],
                  },
                  description:
                    "Initiate nutritional consultation to assess performance of the Mediterranean diet and ensure compliance with allergy guidelines.",
                },
              },
            ],
          },
        ],
        userType: "patients",
      },
      doctorInfo: {
        _id: "68b9c007a8e0d03f196217f4",
        name: "Peter Tsagkouris",
        email: "petertsagouris200@gmail.com",
        telephone: 6986978446,

        city: "Sparti",
        address: "Parori",
        profession: "General Surgeon",
        workingDays: ["Tuesday", "Wednesday", "Thursday", "Friday"],
        workingStartTime: "8:00 AM",
        workingEndTime: "7:00 PM",
        specialDates: ["09/23"],
        appointmentDuration: 30,
        userType: "doctors",
        assistantThread: "thread_y7CiZ1XwrGnCCpn9mlKLMEAw",
      },
    };

    const question = `You are an AI doctor Advisor doctor is using during their appointments to exam the patients and provide recommendations based on their medical history. 
        You help the doctors find relevant information quickly and efficiently taking into consideration the FHIR rules. 
        Here is the doctor's question: What exact steps should I take to examine the patient
        You are given the following information about the appointment, the patient and the doctor: ${JSON.stringify(
          info
        )}
        The response format should be a JSON object with the following structure:
        {
            "text": "The assistant's response text",
            }
            `;
    const trace = startObservation("chat-completion", {
      input: { question },
    });
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });
    const response = JSON.parse(gptResponse.choices[0].message.content);
    console.log(response);
    trace.update({
      output: {
        result: response?.text,
      },
    });
    trace.end();
  } catch (error) {
    console.error("Error populating doctor advices:", error);
  }
};

const generateMessage = async (patientDisease) => {
  try {
    const info = {
      patientInfo: {
        _id: "68e4256e64d19b4d9ab92921",
        name: "Nikos Mastoras",
        email: "nikosmast@gmail.com",
        telephone: 6976789345,
        city: "Sparti",
        address: "Parori",
        gender: "male",
        dateOfBirth: "2000-06-15T21:00:00.000Z",
        bloodType: "AB+",
        weight: 82,
        height: 185,
        medicalHistory: [
          {
            resourceType: "AllergyIntolerance",
            id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
            medicationCodeableConcept: {
              text: "Peanuts",
            },
            subject: {
              reference: "Nikos Mastoras",
            },
            authoredOn: "2025-10-06",
            requester: {
              reference: "Unknown",
            },
            reasonCode: [
              {
                coding: [
                  {
                    system: "http://hl7.org/fhir/sid/icd-10",
                    code: "Z91.010",
                    display: "Peanut allergy",
                  },
                ],
              },
            ],
            dosageInstruction: [
              {
                text: "No dosage applicable for an allergy.",
                timing: {
                  repeat: {
                    frequency: 0,
                    period: 0,
                    periodUnit: "",
                  },
                },
                doseAndRate: [
                  {
                    doseQuantity: {
                      value: 0,
                      unit: "",
                    },
                  },
                ],
              },
            ],
          },
          {
            humanText:
              "Patient Nikos Mastoras is advised to adopt a Mediterranean diet that emphasizes a balanced intake of fruits, vegetables, legumes, whole grains, and olive oil. This nutritional approach is supportive of overall cardiovascular and musculoskeletal health, which is crucial given the patient’s current condition. Extra caution should be exercised to avoid peanut-based products in light of the existing allergy.",
            resourceType: "CarePlan",
            id: "c56f79a8-0cde-4b9b-afbb-7abf9e3c89de",
            intent: "plan",
            subject: {
              reference: "Nikos Mastoras",
            },
            title: "Mediterranean Diet Plan",
            description:
              "A balanced Mediterranean diet designed to enhance overall health and support recovery while accounting for allergy restrictions.",
            created: "2025-10-07",
            author: {
              reference: "Peter Tsagkouris",
            },
            addresses: [
              {
                coding: [
                  {
                    system: "http://hl7.org/fhir/sid/icd-10",
                    code: "Z71.3",
                    display: "Dietary counseling and surveillance",
                  },
                ],
              },
            ],
            activity: [
              {
                detail: {
                  kind: "ServiceRequest",
                  code: {
                    coding: [
                      {
                        system: "http://hl7.org/fhir/sid/icd-10",
                        code: "Z13.220",
                        display: "Encounter for screening for lipoid disorders",
                      },
                    ],
                  },
                  description:
                    "Initiate nutritional consultation to assess performance of the Mediterranean diet and ensure compliance with allergy guidelines.",
                },
              },
            ],
          },
        ],
        userType: "patients",
      },
      doctorInfo: {
        _id: "68b9c007a8e0d03f196217f4",
        name: "Peter Tsagkouris",
        email: "petertsagouris200@gmail.com",
        telephone: 6986978446,

        city: "Sparti",
        address: "Parori",
        profession: "General Surgeon",
        workingDays: ["Tuesday", "Wednesday", "Thursday", "Friday"],
        workingStartTime: "8:00 AM",
        workingEndTime: "7:00 PM",
        specialDates: ["09/23"],
        appointmentDuration: 30,
        userType: "doctors",
        assistantThread: "thread_y7CiZ1XwrGnCCpn9mlKLMEAw",
      },
    };

    const question = `You are a clinical decision-support assistant. 
      Based on the doctor's notes, patient history, and the reason for today’s appointment, 
      summarize the key clinical issues and suggest possible classes of medications or treatment options that a licensed physician might consider. 
      Provide a prescription and exact dosage if asked or advices/recommendations. 
       Include any important safety considerations (e.g., allergies, contraindications, drug interactions, age-related risks). 
       The output should never include a warning regarding that you can't provide valid prescriptions (I will inform the users about that)
       The responses should be based on the FHIR (Fast Healthcare Interoperability Resources) standards and guidelines while using the ICD-10 coding.
       Each prescription/recommendation is separate from each other (don't use words like alternative, another etc)
       Do not include any title, context, numbers or bullet points about what each section is
        Format the output as a JSON array of objects, where each object contains the following fields (create at least 3 elements/alternatives):
        {
          {
            "humanText": "A detailed human-readable text of the prescription or advice. The format should be from doctor's perspective",
            "resourceType": "The type of the care plan, e.g., CarePlan",
            "id": "A unique identifier for the care plan (generate a random uuid)",
            "intent": "plan",
            "subject": { "reference": "The name of the patient" },
            "title": "The title of the care plan",
            "description": "A brief description of the care plan",
            "created": "The date the care plan was created",
            "author": { "reference": "The name of the doctor" },
            "addresses": [
              {
                "coding": [
                  {
                    "system": "http://hl7.org/fhir/sid/icd-10",
                    "code": "The ICD-10 code of the condition",
                    "display": "The description of the ICD-10 code"
                  }
                ]
              }
            ],
            "activity": [
              {
                "detail": {
                  "kind": "ServiceRequest",
                  "code": {
                    "coding": [
                      {
                        "system": "http://hl7.org/fhir/sid/icd-10",
                        "code": "Z13.220",
                        "display": "Encounter for screening for lipoid disorders"
                      }
                    ]
                  },
                  "description": "Order fasting lipid panel"
                }
              },
            ]
          }
        }
       The doctor's question is: Create a prescription for the patient based on the information provided.
       
       Use the following context to make the sections relevant and supportive:
       Today's date is ${new Date().toISOString().split("T")[0]}.
       Doctor notes: I found that the patient has ${patientDisease}
        Doctor info: ${JSON.stringify(info.doctorInfo)}
        Patient info: ${JSON.stringify(info.patientInfo)}
       `;
    const trace = startObservation("chat-completion-message", {
      input: { question },
    });
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });
    const response = JSON.parse(gptResponse.choices[0].message.content);
    console.log(response);
    trace.update({
      output: {
        result: response,
      },
    });
    trace.end();
  } catch (error) {
    console.error("Error populating doctor advices:", error);
  }
};

const evaluateAssistantCompletion = async (messages) => {
  try {
    const question = `You are given a conversation between a patient and an AI medical assistant responsible for appointment sceduling and preliminary medical advice.
    Evaluate the assistants responses based on the following criteria:
    1. Accuracy: Evaluate wether the advice or prescription output provided is correct. Use established clinical guidelines and general medical knowledge as your reference.
    2. Evaluate wether the output is focussed in the query of the user and only contains the information that where requested without any additional unnecessary or irrelevant information.
    3. Evaluate the hallucination level of the output based on the input data provided. Assign a score from 0 to 1 where 0 means that no hallucinations occurred in the output and 1 means that the output had unreliable data and misleading knowledge and made up facts.
    4. Evaluate the relevance of the context provided. Assign a score from 0 to 1 where 0 is no relevance and 1 is full relevance. A context is considered relevant when the model output has used information of the context in order to generate an appropriate response. 
    Every criteria should be rated on a scale from 0 to 1 where 0 means that the criteria was not met at all and 1 means that the criteria was fully satisfied.
    Here is the conversation: ${JSON.stringify(messages)}
    Format the output as a JSON object with the following structure:
    {
      "accuracy": "score from 0 to 1",
      "conciseness": "score from 0 to 1",
      "hallucination": "score from 0 to 1",
      "contextRelevance": "score from 0 to 1"
    }
    `;
    const trace = startObservation("assistant-completion-eval", {
      input: { question },
    });
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });
    const response = JSON.parse(gptResponse.choices[0].message.content);
    console.log(response);
    trace.update({
      output: {
        result: response,
      },
    });
    trace.end();
  } catch (error) {
    console.error("Error evaluating assistant completion:", error);
  }
};

export { generateDoctorAdvice, generateMessage, evaluateAssistantCompletion };
