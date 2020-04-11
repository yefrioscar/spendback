import { CognitoUserPoolTriggerHandler, CognitoUserPoolTriggerEvent } from 'aws-lambda';

export const handler: CognitoUserPoolTriggerHandler = async (event: CognitoUserPoolTriggerEvent) => {
    event.response.autoConfirmUser = true;

    if(event.request.userAttributes.phone_number) {
        event.response.autoVerifyPhone = true;
    } else {
        event.response.autoVerifyEmail = true;
    }

    return event;
};