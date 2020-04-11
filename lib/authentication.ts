import * as cdk from "@aws-cdk/core";
import {
    UserPool,
    UserPoolClient,
    CfnIdentityPool,
} from "@aws-cdk/aws-cognito";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";

export class Authentication extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props?: any) {
        super(scope, id);

        const defineAuthChallenge = new lambda.Function(
            this,
            "defineAuthChallenge",
            {
                runtime: lambda.Runtime.NODEJS_12_X,
                handler: "defineAuthChallenge.handler",
                code: lambda.Code.fromAsset("lambda/authentication"),
            }
        );

        const createAuthChallenge = new lambda.Function(
            this,
            "createAuthChallenge",
            {
                runtime: lambda.Runtime.NODEJS_12_X,
                handler: "lambda/authentication/createAuthChallenge.handler",
                code: lambda.Code.fromAsset("lambdas.zip")
            }
        );

        let snsSendSms = new iam.PolicyStatement({
            resources: ['*'],
            actions: ['sns:publish'],
            effect: iam.Effect.ALLOW
        })
        
       createAuthChallenge.addToRolePolicy(snsSendSms);
 


        const verifyAuthChallenge = new lambda.Function(
            this,
            "verifyAuthChallenge",
            {
                runtime: lambda.Runtime.NODEJS_12_X,
                handler: "verifyAuthChallenge.handler",
                code: lambda.Code.fromAsset("lambda/authentication"),
            }
        );

        const preSignUpAutoVerifyAccount = new lambda.Function(
            this,
            "preSignUpAutoVerifyAccount",
            {
                runtime: lambda.Runtime.NODEJS_12_X,
                handler: "preSignUpAutoVerifyAccount.handler",
                code: lambda.Code.fromAsset("lambda/authentication"),
            }
        );

        const userPool = new UserPool(this, "myUserPool", {
            userPoolName: "spend",
            signInAliases: {
                phone: true,
                email: true,
            },
            lambdaTriggers: {
                defineAuthChallenge: defineAuthChallenge,
                createAuthChallenge: createAuthChallenge,
                verifyAuthChallengeResponse: verifyAuthChallenge,
                preSignUp: preSignUpAutoVerifyAccount
            },
            selfSignUpEnabled: true,
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true
            }
        });

        const userPoolClient = new UserPoolClient(this, "myUserPoolClient", {
            userPoolClientName: "spend-default",
            userPool: userPool,
        });

        const idp = new CfnIdentityPool(this, "cognitoIdp", {
            allowUnauthenticatedIdentities: false,
            cognitoIdentityProviders: [
                {
                    providerName: userPool.userPoolProviderName,
                    clientId: userPoolClient.userPoolClientId,
                },
            ],
        });



        
    }
}
