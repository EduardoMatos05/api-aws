const AWS = require('aws-sdk');
require('dotenv').config();

const sns = new AWS.SNS({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION
});

async function enviarEmail(alumno) {
    const mensaje = `
Información del Alumno:
Nombre: ${alumno.nombres} ${alumno.apellidos}
Matrícula: ${alumno.matricula}
Promedio: ${alumno.promedio}
    `;

    const params = {
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: mensaje,
        Subject: `Calificaciones de ${alumno.nombres} ${alumno.apellidos}`
    };

    await sns.publish(params).promise();
}

module.exports = { enviarEmail };