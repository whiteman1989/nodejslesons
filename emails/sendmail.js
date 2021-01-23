const nodemailer = require('nodemailer');
const {EMAIL_FROM, BASE_URL} = require('../keys');

var testAccount;
var transporter;

async function transporterInit(){
    if(!testAccount){
        testAccount = await nodemailer.createTestAccount();
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        })
    }
}



async function sendRegMail(user) {
    await transporterInit();

    await transporter.sendMail({
        to: user.email,
        from: EMAIL_FROM,
        subject: 'Registration Comfirned',
        html: `
            <h1>Hello in our shop</h1>
            <p>${user.name}: Registration sucessful</p>
            <hr />
            <a href="${BASE_URL}">shop</a>
            `
    },(error, info)=>{
        if (error) {
            console.log('Error occurred');
            console.log(error.message);
            return process.exit(1);
        }

        console.log('Message sent successfully!');
        console.log(nodemailer.getTestMessageUrl(info));
    })

}

async function sendResMail(user) {
    await transporterInit();

    await transporter.sendMail({
        to: user.email,
        from: EMAIL_FROM,
        subject: 'Password reset',
        html: `
            <h1>Password reset</h1>
            <p>${user.name}: If you don't wish to reset your password, 
            disregard this email and no action will be taken.</p>
            <p> Follow the link below to set a new password: </p>
            <p><a href="${BASE_URL}/auth/password/${user.resetToken}">reset password</a></P>
            <hr />
            <a href="${BASE_URL}">shop</a>
            `
    },(error, info)=>{
        if (error) {
            console.log('Error occurred');
            console.log(error.message);
            return process.exit(1);
        }

        console.log('Message sent successfully!');
        console.log(nodemailer.getTestMessageUrl(info));
    })
}

module.exports.sendRegMail = sendRegMail;
module.exports.sendResMail = sendResMail;

