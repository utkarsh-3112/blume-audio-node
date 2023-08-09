export function getPdfJson(summaryJson, selectedOption) {
    if(selectedOption === 'Song') {
        const pdfJson = {
            "Title": "",
            "Artist": "",
            "Genre": "",
            "Main Themes": [],
            "Emotions and Mood": [],
            "Message and Story": "",
            "Lyrics Highlights": []
        };
        for (let i = 0; i < summaryJson.length; i++) {
            const pdfReport = JSON.parse(summaryJson[i]);
            pdfJson["Title"] = (pdfJson["Title"] || "") + pdfReport["Title"];
            pdfJson["Artist"] = (pdfJson["Artist"] || "") + pdfReport["Artist"];
            pdfJson["Genre"] = (pdfJson["Genre"] || "") + pdfReport["Genre"];
            pdfJson["Message and Story"] = (pdfJson["Message Story"] || "") + pdfReport["Message Story"];
            pdfReport["Main Themes"].forEach((point) => {
                if (!pdfJson["Main Themes"].includes(point)) {
                    pdfJson["Main Themes"].push(point);
                }
            });
            pdfReport["Emotions and Mood"].forEach((point) => {
                if (!pdfJson["Emotions and Mood"].includes(point)) {
                    pdfJson["Emotions and Mood"].push(point);
                }
            });
            pdfReport["Lyrics Highlights"].forEach((point) => {
                if (!pdfJson["Lyrics Highlights"].includes(point)) {
                    pdfJson["Lyrics Highlights"].push(point);
                }
            })
        }
        return pdfJson;
    } else if(selectedOption === "Audio Book") {
        const pdfJson = {
            "AudioBook Title" : "",
            "Author" : "",
            "Introduction And Setting" : "",
            "Main Plot And Storyline" : "",
            "Key Characters": [],
            "Themes And Messages" : "",
            "Character Development": "",
            "Conflict And Challenges": "",
            "Significant Events": [],
            "Writing Style And Narrative Techniques": "",
            "Overall Impact And Impression": "",
            "Notable Quotes Or Passages": []
        }

        for (let i = 0; i < summaryJson.length; i++) {
            const pdfReport = JSON.parse(summaryJson[i]);
            pdfJson["AudioBook Title"] = (pdfJson["AudioBook Title"] || "") + pdfReport["AudioBook Title"];
            pdfJson["Author"] = (pdfJson["Author"] || "") + pdfReport["Author"];
            pdfJson["Introduction And Setting"] = (pdfJson["Introduction And Setting"] || "") + pdfReport["Introduction And Setting"];
            pdfJson["Main Plot And Storyline"] = (pdfJson["Main Plot And Storyline"] || "") + pdfReport["Main Plot And Storyline"];
            pdfJson["Themes And Messages"] = (pdfJson["Themes And Messages"] || "") + pdfReport["Themes And Messages"];
            pdfJson["Character Development"] = (pdfJson["Character Development"] || "") + pdfReport["Character Development"];
            pdfJson["Conflict And Challenges"] = (pdfJson["Conflict And Challenges"] || "") + pdfReport["Conflict And Challenges"];
            pdfJson["Writing Style And Narrative Techniques"] = (pdfJson["Writing Style And Narrative Techniques"] || "") + pdfReport["Writing Style And Narrative Techniques"];
            pdfJson["Overall Impact And Impression"] = (pdfJson["Overall Impact And Impression"] || "") + pdfReport["Overall Impact And Impression"];
            pdfReport["Key Characters"].forEach((point) => {
                if (!pdfJson["Key Characters"].includes(point)) {
                    pdfJson["Key Characters"].push(point);
                }
            });
            pdfReport["Significant Events"].forEach((point) => {
                if (!pdfJson["Significant Events"].includes(point)) {
                    pdfJson["Significant Events"].push(point);
                }
            });
            pdfReport["Notable Quotes Or Passages"].forEach((point) => {
                if (!pdfJson["Notable Quotes Or Passages"].includes(point)) {
                    pdfJson["Notable Quotes Or Passages"].push(point);
                }
            })
        }
        return pdfJson;

    } else if(selectedOption === 'Podcast') {
        const pdfJson = {
            "Summary": "",
            "Key Discussion Points": [],
            "Tweetable Quotes" : []
        };
        for (let i = 0; i < summaryJson.length; i++) {
            const pdfReport = JSON.parse(summaryJson[i]);
            pdfJson["Summary"] = (pdfJson["Summary"] || "") + pdfReport["Summary"];
            pdfReport["Key Discussion Points"].forEach((point) => {
                if (!pdfJson["Key Discussion Points"].includes(point)) {
                    pdfJson["Key Discussion Points"].push(point);
                }
            });
            pdfReport["Tweetable Quotes"].forEach((point) => {
                if (!pdfJson["Tweetable Quotes"].includes(point)) {
                    pdfJson["Tweetable Quotes"].push(point);
                }
            });
        }
        return pdfJson;

    }
}