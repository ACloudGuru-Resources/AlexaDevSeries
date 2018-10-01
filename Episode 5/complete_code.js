/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const locale = handlerInput.requestEnvelope.request.locale;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(locale).then(function(res) {
      var product = res.inSkillProducts.filter(record => record.referenceName == 'Hello');

      if (isEntitled(product)) {
        const speechText = 'Hello World!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      } else {
        const upsell = "You don't own the Hello pack, Do you want to learn more?";

        return handlerInput.responseBuilder
        .addDirective({
          'type': 'Connections.SendRequest',
          'name': 'Upsell',
          'payload': {
            'InSkillProduct': {
              'productId': product[0].productId
            },
            'upsellMessage': upsell
          },
          'token': 'correlationToken'
        })
        .getResponse();
      }
    })
  },
};

// Upsell Response Handler
const UpsellResponseHandler = {
  canHandle(handlerInput) {
    console.log(handlerInput.requestEnvelope.request);
    return handlerInput.requestEnvelope.request.type === 'Connections.Response'
      && handlerInput.requestEnvelope.request.name === 'Upsell';
  },
  handle(handlerInput) {
    if (handlerInput.requestEnvelope.request.status.code = 200) {
      if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'DECLINED') {
        const speakResponse = "OK, I can't say hello you then.";
        const repromptResponse = "Do you want something else?";
        return handlerInput.responseBuilder
          .speak(speakResponse)
          .reprompt(repromptResponse)
          .getResponse();
      } else if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'ACCEPTED') {
          const speakResponse = "You can now say Hello";
          const repromptResponse = "You can now say Hello";
          return handlerInput.responseBuilder
            .speak(speakResponse)
            .reprompt(repromptResponse)
            .getResponse();
      }
    } else {
      // Failure
      console.log('Connections.Response failure. Error is: ' + handlerInput.requestEnvelope.request.status.message);
      return handlerInput.responseBuilder
        .speak("Error handling purchase request. Please try again")
        .getResponse();
    }
  }
}

// Buy Response Handler
const BuyResponseHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'Connections.Response'
      && handlerInput.requestEnvelope.request.name === 'Buy';
  },
  handle(handlerInput) {
    const locale = handlerInput.requestEnvelope.request.locale;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
    const productId = handlerInput.requestEnvelope.request.payload.productId;

    return ms.getInSkillProducts(locale).then(function(res) {
      let product = res.inSkillProducts.filter(record => record.productId == productId);
      if (handlerInput.requestEnvelope.request.status.code = 200) {
        if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'ACCEPTED') {
          const speakResponse = "You can now say Hello";
          const repromptResponse = "You can now say Hello";
          return handlerInput.responseBuilder
            .speak(speakResponse)
            .reprompt(repromptResponse)
            .getResponse();
        } else if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'DECLINED') {
          const speakResponse = "Your purchase was declined";
          const repromptResponse = "Your purchase was declined";
          return handlerInput.responseBuilder
            .speak(speakResponse)
            .reprompt(repromptResponse)
            .getResponse();
        }
      }
    })
  }
}

function isProduct(product)
{
  return product && product.length > 0;
}

function isEntitled(product)
{
  return isProduct(product) && product[0].entitled == 'ENTITLED';
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

// Buy Handler
const BuyHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.name === 'BuyHandler';
  },
  handle(handlerInput) {
    const locale = handlerInput.requestEnvelope.request.locale;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(locale).then(function(res) {
      let product = res.inSkillProducts.filter(record => record.referenceName == "Hello");
      return handlerInput.responseBuilder
      .addDirective({
        'type': 'Connections.SendRequest',
        'name': 'Buy',
        'payload': {
          'InSkillProduct': {
            'ProductId': product[0].productId
          }
        },
        'token': 'correlationToken'
      })
      .getResponse();
    })
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    UpsellResponseHandler,
    BuyResponseHandler,
    BuyHandler
  )
  .withApiClient(new Alexa.DefaultApiClient())
  .addErrorHandlers(ErrorHandler)
  .lambda();
