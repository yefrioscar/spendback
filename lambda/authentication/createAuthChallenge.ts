import {
    CognitoUserPoolTriggerHandler,
    CognitoUserPoolTriggerEvent,
} from "aws-lambda";
import { randomDigits } from "crypto-secure-random-digit";
import * as mail from "@sendgrid/mail";
import * as AWS from 'aws-sdk';

mail.setApiKey('API_KEY');

const sns = new AWS.SNS({ apiVersion: '2010-03-31' });

export const handler: CognitoUserPoolTriggerHandler = async (
    event: CognitoUserPoolTriggerEvent
) => {
    let secretLoginCode: string;
    console.log("ATTR", event.request.userAttributes);

    let isEmail = event.request.userAttributes.email || false;

    if (!event.request.session || !event.request.session.length) {
        // This is a new auth session
        // Generate a new secret login code and mail it to the user
        secretLoginCode = randomDigits(6).join("");

        if (isEmail) {
            await sendEmail(
                event.request.userAttributes.email,
                secretLoginCode
            );
        } else {
            await sendSms(event.request.userAttributes.phone_number, secretLoginCode)
        }
    } else {
        // There's an existing session. Don't generate new digits but
        // re-use the code from the current session. This allows the user to
        // make a mistake when keying in the code and to then retry, rather
        // the needing to e-mail the user an all new code again.
        const previousChallenge = event.request.session.slice(-1)[0];
        secretLoginCode = previousChallenge.challengeMetadata!.match(
            /CODE-(\d*)/
        )![1];
    }

    // This is sent back to the client app
    event.response.publicChallengeParameters = isEmail
        ? {
              email: event.request.userAttributes.email,
          }
        : { phone_number: event.request.userAttributes.phone_number };

    // Add the secret login code to the private challenge parameters
    // so it can be verified by the "Verify Auth Challenge Response" trigger
    event.response.privateChallengeParameters = { secretLoginCode };

    // Add the secret login code to the session so it is available
    // in a next invocation of the "Create Auth Challenge" trigger
    event.response.challengeMetadata = `CODE-${secretLoginCode}`;

    return event;
};

async function sendEmail(emailAddress: string, secretLoginCode: string) {
    const config = {
        email: "no-reply@spend-secure.com",
        name: "Spend Team",
        template_id: "d-14b75e7e581c42948449bd3d89baf1b9",
    };

    const options = {
        personalizations: [
            {
                to: [
                    {
                        email: emailAddress,
                        name: "",
                    },
                ],
                dynamic_template_data: {
                    OTPCode: secretLoginCode,
                    subject: `Your One Time Password`,
                    preheader: "This is valid por the next 3 minutes.",
                },
            },
        ],
        from: {
            email: config.email,
            name: config.name,
        },
        reply_to: {
            email: config.email,
            name: config.name,
        },
        templateId: config.template_id,
    };

    await mail.send(options);
}

async function sendSms(phone_number: string, secretLoginCode: string) {
    var params = {
        Message: `Your One Time password is: ${secretLoginCode}`,
        PhoneNumber: phone_number,
        MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
                'DataType': 'String',
                'StringValue': 'Transactional'
            }
        }
    };

    await sns.publish(params).promise();
}
