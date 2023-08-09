import nodemailer from "nodemailer";
import fs, {createWriteStream} from "fs";
import PDFDocument from "pdfkit";
export default async function sendEmail(emailAddress, pdfJson, transcript) {
    const doc = new PDFDocument();
    const fileName = "summary.pdf";
    const outputStream = createWriteStream(fileName);
    doc.pipe(outputStream);


    const headingStyle = { fontSize: 16, margin: [0, 10, 0, 0] };
    const subheadingStyle = { fontSize: 10, margin: [0, 5, 0, 0] };
    const contentStyle = { fontSize: 10, margin: [0, 0, 0, 5] };

    doc.font('Helvetica');

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function iterateJsonObject(obj, depth = 0) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];

                // Write capitalized keys as headings
                doc.fillColor('black').font('Helvetica-Bold').text(capitalizeFirstLetter(key), headingStyle);
                if (Array.isArray(value)) {
                    // Handle arrays with bullets
                    for (const item of value) {
                        if (typeof item === 'object') {
                            doc.moveDown();
                            for(const key2 in item) {
                                doc.fillColor('black').font('Helvetica-Bold').fontSize(10).text(key2, subheadingStyle);
                                doc.fillColor('black').font('Helvetica').fontSize(10).text(item[key2], contentStyle);
                                doc.moveDown();
                            }
                        } else {
                            doc.fillColor('black').font('Helvetica').list([item], { bulletRadius: 2, indent: 20, textIndent: 22, fontSize: 10 });
                        }
                    }
                } else if (typeof value === 'object') {
                    // Handle nested JSON objects
                    for(const key2 in value) {
                        doc.fillColor('black').font('Helvetica-Bold').fontSize(10).text(key2, subheadingStyle);
                        doc.fillColor('black').font('Helvetica').fontSize(10).text(value[key2], contentStyle);
                        doc.moveDown();
                    }
                } else {
                    // Write text values
                    doc.fillColor('black').font('Helvetica').fontSize(10).text(value, contentStyle);
                }

                // Add line break between headings and content
                doc.moveDown();
            }
        }
    }

    iterateJsonObject(pdfJson);
    doc.end();

    outputStream.on("finish", () => {
        const pdfBuffer = fs.readFileSync(fileName);

        const transporter = nodemailer.createTransport({
            host: process.env.TRANSPORTER_HOST,
            port: 587,
            auth: {
                user: process.env.TRANSPORTER_AUTH_USER,
                pass: process.env.TRANSPORTER_AUTH_PASSWORD,
            },
        });

        const message = {
            from: "utkarshagarwal9757@gmail.com",
            to: emailAddress,
            subject: `Summary PDF`,
            text: `Summary PDF`,
            attachments: [
                {
                    filename: `summary.pdf`,
                    content: pdfBuffer,
                },
            ],
        };

        // Send the email
        transporter.sendMail(message, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log(info);
            }
        });
    });
}