import * as cdk from "@aws-cdk/core";
import {
    UserPool,
    UserPoolClient,
    CfnUserPoolIdentityProvider,
    CfnIdentityPool,
} from "@aws-cdk/aws-cognito";
import * as lambda from "@aws-cdk/aws-lambda";

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
                handler: "createAuthChallenge.handler",
                code: lambda.Code.fromAsset("lambda/authentication"),
            }
        );

        const verifyAuthChallenge = new lambda.Function(
            this,
            "verifyAuthChallenge",
            {
                runtime: lambda.Runtime.NODEJS_12_X,
                handler: "verifyAuthChallenge.handler",
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
            },
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
