'use strict' 

const token = process.env.FB_VERIFY_TOKEN //Palabra clave en este caso corpnan
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const access = "EAAN77t59uJEBADoLPTwIwhaGvTYsqrEKx2yotWjzj4IJA77nnXCK1V3NWHjqYru31qQZAnVUbL3siXIFY2GtDQUFpIFazJnpuKUqqWP2aZBypAueYMubcb4lInYPe8tmL0YmOF0QEqSU7rlejxFli2LdNV7VZAjiSGcLDxdzgZDZD";
// const access = process.env.FB_ACCESS_TOKEN //Token de la pagina en FB

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === token) {
        res.send(req.query['hub.challenge'])
    }
    res.send('No sir')
})

app.get('/terminos-y-condiciones', function (req, res) {
    res.send('Estamos trabajando en esta seccion')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});
  
/*function receivedMessage(event) {
  // Putting a stub for now, we'll expand it in the following steps
  console.log("Message data: ", event.message);
}*/

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendTextMessage(recipientId, messageText) {
  if(messageText=="Buenos dias"){
    messageText="Buenos días {{user_first_name}}, ¿en que podemos ayudarte?";
  }
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: access },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("No se pudo enviar el mensaje.");
      console.error(response);
      console.error(error);
    }
  });  
}

/*
function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
*/

function sendGenericMessage(recipientId, messageText) {
   var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Hermanos de 4 y 9 años caen al río Magdalena y desaparecen",
            subtitle: "El hecho ocurrió la tarde del domingo anterior en el corregimiento de Palermo. Abuelo de los menores pide colaboración de las autoridades para su búsqueda.",
            item_url: "ELHERALDO.CO",
            image_url: "https://www.elheraldo.co/sites/default/files/styles/width_860/public/articulo/2017/03/13/palermo.jpg?itok=iv38DMS5",
            buttons: [{
              type: "web_url",
              url: "https://www.elheraldo.co/barranquilla/hermanos-de-4-y-9-anos-caen-al-rio-magdalena-y-desaparecen-336450",
              title: "Ver noticia"
            }/*, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }*/],
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}