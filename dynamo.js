const AWS = require('aws-sdk');
require('dotenv').config();

const dynamo = new AWS.DynamoDB.DocumentClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION
});

const TABLE = 'sesiones-alumnos';

async function crearSesion(alumnoId, sessionString) {
    const item = {
        id: require('uuid').v4(),
        fecha: Math.floor(Date.now() / 1000),
        alumnoId: alumnoId,
        active: true,
        sessionString: sessionString
    };

    await dynamo.put({
        TableName: TABLE,
        Item: item
    }).promise();

    return item;
}

async function buscarSesion(alumnoId, sessionString) {
    const result = await dynamo.scan({
        TableName: TABLE,
        FilterExpression: 'alumnoId = :aid AND sessionString = :ss',
        ExpressionAttributeValues: {
            ':aid': alumnoId,
            ':ss': sessionString
        }
    }).promise();

    return result.Items[0] || null;
}

async function desactivarSesion(sessionId) {
    await dynamo.update({
        TableName: TABLE,
        Key: { id: sessionId },
        UpdateExpression: 'SET active = :val',
        ExpressionAttributeValues: { ':val': false }
    }).promise();
}

module.exports = { crearSesion, buscarSesion, desactivarSesion };