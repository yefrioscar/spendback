import { CognitoUserPoolTriggerHandler, CognitoUserPoolTriggerEvent } from 'aws-lambda';

export const handler: CognitoUserPoolTriggerHandler = async (event: CognitoUserPoolTriggerEvent) => {
    const expectedAnswer = event.request.privateChallengeParameters!
        .secretLoginCode;
    if (event.request.challengeAnswer === expectedAnswer) {
        event.response.answerCorrect = true;
    } else {
        event.response.answerCorrect = false;
    }
    return event;
};
