import axios from "axios";
import fs, { createWriteStream } from "fs";
import ffmpeg from "fluent-ffmpeg";
import * as FileType from "file-type";
import { Configuration, OpenAIApi } from "openai";
import sendEmail from "../utils/sendEmail.js";
import {getPdfJson} from "../utils/pdf.js";

const config = new Configuration({
  apiKey: process.env.OPENAI_APIKEY,
});

// ... other imports and constants

const API_URL =
    process.env.HUGGING_API_URL;

async function audioToReport(download_url, email_address, file_extension, selectedOption) {
    const file_path = await downloadFile(download_url, file_extension);
    const transcript = await processFile(file_path, file_extension);
     const summary_json = await summarizeText(transcript, selectedOption);
    console.log("SUMMARY JSON\n" + summary_json);
    await generatePdf(selectedOption,summary_json, transcript, email_address);
}

async function downloadFile(downloadUrl, fileType) {
    console.log("In download")
    console.log(downloadUrl);
    const response = await axios.get(downloadUrl, {
        responseType: "arraybuffer",
    });
    // console.log(response)
    const filePath = "C:/Users/utkar/Desktop/downloaded_file." + fileType;
    fs.writeFileSync(filePath, response.data);

  // If the file is a video, convert it to audio
  if (["mp4", "mov", "avi", "wmv", "flv", "mkv", "webm"].includes(fileType)) {
    const audioPath = "/tmp/downloaded_file.mp3";

    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .noVideo()
        .output(audioPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    return audioPath;
  }

  console.log("File is downloaded at, ", filePath);

  return filePath;
}

function splitPrompt(prompt) {
  const maxTokens = 6000;
  const transcript = prompt.split(" ");
  const tokenCount = transcript.length;
  const chunks = [];
  let chunk = "";

  for (let i = 0; i < tokenCount; i++) {
    if (chunk.length + transcript[i].length < maxTokens) {
      chunk += transcript[i] + " ";
    } else {
      chunks.push(chunk);
      chunk = "";
    }
  }

  if (chunk.length > 0) {
    chunks.push(chunk);
  }

  console.log("\nChunks: " + chunks);
  return chunks;
}

async function processFile(filePath, fileExtension) {
  var data = fs.readFileSync(filePath);

  console.log(filePath);

  // get content type of file
  let contentType = await FileType.fileTypeFromFile(filePath);
  contentType = contentType ? contentType.mime : "";

  console.log(contentType);

  // handle m4a files
  if (fileExtension === "m4a") {
    contentType = "audio/m4a";
  }

  const headers = {
    Authorization: process.env.BEARER_TOKEN,
    "Content-Type": contentType,
    Accept: null,
  };

  try {
    const response = await axios.post(API_URL, data, { headers: headers });
    const transcript = response.data.text;
    console.log("Hugging Face Response: ", transcript);
    return transcript;
  } catch (e) {
    console.error(e);
    return await processFile(filePath, fileExtension);
  }

  return "";
}

async function summarizeText(text, selectedOption) {
  const transcriptChunks = splitPrompt(text);
  const responses = [];
  console.log(transcriptChunks.length);
  const openai = new OpenAIApi(config);

    let finalPrompt = "";
    let assistantPrompt = "";

    if (selectedOption === "Audio Book") {
        finalPrompt = `Summarize the following transcript of an audio book:\n\n
        ${transcriptChunks[0]}
        \n\nPlease provide the following:
        Key "summary" - create a summary. Limit to 300 words.
        Key "Introduction and Setting" - Introduce the audiobook by providing its title and author.\n
        Describe the initial setting and atmosphere of the story.\n
        Mention any important background information that sets the stage.
        Key "Main Plot and Storyline" - Summarize the central plot of the audiobook in a few sentences.\n
        Highlight the primary events and developments that drive the story forward.
        Key "Characters" - Introduce the main characters of the audiobook and their roles.\n
        Provide a brief description of each character's personality and motivations.
        Key "Themes and Messages" - Identify the central themes explored in the audiobook.\n
        Discuss the messages or lessons that the author conveys through the story.
        Key "Character Development" - Describe how the main characters evolve or change over the course of the story.\n
        Highlight any pivotal moments that contribute to their growth
        Key "Conflict and Challenges" - Outline the major conflicts or challenges that the characters face.\n
        Explain how these obstacles shape the trajectory of the story.
        Key "Significant Events" - Summarize the most impactful events or turning points in the audiobook.\n
        Discuss how these events impact the characters and the plot.
        Key "Writing Style and Narrative Techniques" - Analyze the author's writing style, including tone and pacing.\n
        Highlight any unique narrative techniques employed in the audiobook.
        Key "Overall Impact and Impression" - Share your thoughts on the overall effect of the audiobook.\n
        Discuss how the story and characters left an impression on you.
        Key "Notable Quotes or Passages" - Quote and discuss any memorable lines or passages from the audiobook.\n
        Explain why these quotes stood out to you and their significance.`;

        assistantPrompt = `You are an assistant that only speaks JSON. Do not write normal text.
        Example formatting:
        {
            "AudioBook Title": "Mysteries of Solitude",
            "Author": "Jane Doe",
            "Introduction And Setting": "In the audiobook \"Mysteries of Solitude\" by Jane Doe, readers are transported to the quaint town of Willowbrook, nestled in the heart of the mountains. The story unfolds against a backdrop of mist-covered landscapes and a sense of quiet anticipation.",
            "Main Plot And Storyline": "The audiobook follows the journey of Olivia Sinclair, a young artist who inherits an enigmatic old mansion. As Olivia begins to unravel the mysteries surrounding the mansion's previous occupants, she discovers a series of hidden journals that hint at a long-lost treasure and a tragic love story that spans generations.",
            "Key Characters": [
             {
                "Name": "Olivia Sinclair",
                "Description": "A determined and curious artist, Olivia's quest for answers drives the narrative. Her passion for art and history fuels her determination to uncover the truth."
             },
             {
                "Name": "Eleanor and William",
                "Description": "The star-crossed lovers from the past, whose stories become intertwined with Olivia's journey."
             }
            ],
            "Themes And Messages": "Mysteries of Solitude delves into themes of love, loss, and the timeless nature of human connections. The audiobook reminds listeners that the echoes of the past continue to shape the present, and the pursuit of knowledge can be a powerful force.",
            "Character Development": "Throughout the audiobook, Olivia transforms from a hesitant heir to a confident investigator. As she deciphers the journals and uncovers the truth about Eleanor and William, Olivia learns to embrace her own identity and creative potential.",
            "Conflict And Challenges": "Olivia faces numerous challenges, from deciphering cryptic clues to navigating the emotional complexities of Eleanor and William's story. The mansion's deteriorating condition and the resistance from townsfolk add layers of tension to her journey.",
            "Significant Events": [
             "A pivotal moment occurs when Olivia discovers a hidden chamber within the mansion, containing artifacts that shed light on the past.",
             "Another significant event unfolds as Olivia confronts the town's secrets, ultimately leading to a climactic confrontation."
            ],
            "Writing Style And Narrative Techniques": "Jane Doe's writing style seamlessly blends lyrical descriptions of the setting with suspenseful plot developments. The alternating perspectives between Olivia and the historical figures create a sense of intrigue and depth.",
            "Overall Impact And Impression": "Mysteries of Solitude is a captivating exploration of history's resonance in the present. The audiobook's seamless fusion of mystery and emotion leaves a lasting impact, reminding listeners of the power of human connection across time.",
            "Notable Quotes Or Passages": [
             "\"Amidst the silence of solitude, the whispers of the past beckon us to uncover their long-buried truths.\" - Jane Doe"
            ]
        }`;
    } else if (selectedOption === "Podcast") {
        finalPrompt = `Summarize the following transcript of a podcast:\n\n
        ${transcriptChunks[0]}
        \n\nPlease provide the following:
        Key "summary" - create a summary. Limit to 120 words.
        Key "Key Discussion Points" - create a list of key discussion points. Limit to 3 points.
        Key "Tweetable Quotes" - create a list of tweetable quotes. Limit to 3 quotes.`;
        assistantPrompt = `You are an assistant that only speaks JSON. Do not write normal text.
    Example formatting:
    {
      "Summary": "Podcast is a partner at a16z. He is a former founder and CEO of a company that was acquired by Google. He is also a former partner at Y Combinator.",
      "Key Discussion Points": [
        "He tells about his journey from being a shy nerd kid to going to Wharton and then starting a company.",
        "He talks about how he got into venture capital and what he looks for in founders.",
      ],
      "Tweetable Quotes": [
        "I think the exceptional people are the ones who want to prove it to the world.",
        "SaaS is gone now. It's all about the API economy. Creators are the new SaaS.",
      ],
    }`;
    } else if (selectedOption === "Song") {
        finalPrompt = `Summarize the following transcript of a song:\n\n
        ${transcriptChunks[0]}
        \n\nPlease provide the following:
        Key "Title/Artist/Genre of the Song" - Title of the Song\nArtist\nGenre.
        Key "Main theme" - What are the central themes or topics explored in the song?
        Key "Emotions and Mood" - How would you describe the overall mood or emotional tone of the song? Is it joyful, somber, intense, etc.?
        Key "Message and Story" - What message or narrative does the song convey? Is there a particular story being told?
        Key "Lyrics Highlights" - Are there any specific lines or lyrics that you consider especially significant or memorable?
        `;
        assistantPrompt = `You are an assistant that only speaks JSON. Do not write normal text.
        Example formatting:
        {
           "Title": "Bohemian Rhapsody",
           "Artist": "Queen",
           "Genre": "Rock",
           "Main Themes": ["Fantasy", "Emotional turmoil", "Self-discovery"],
           "Emotions and Mood": ["Dramatic", "Energetic", "Melancholic"],
           "Message and Story": "The song follows a narrative of a person's inner struggles and self-discovery.",
           "Lyrics Highlights": ["Is this the real life? Is this just fantasy?", "Caught in a landslide, no escape from reality.", "Nothing really matters, anyone can see."]
        }`;
    }

    finalPrompt += `Remember that you are an assistant which only speaks JSON. Do not give any explanation or reasoning for the response. No greetings or salutations. No any other kind of text. Do not include '\n' or '\\n' in your response. \n\n`;


    for (let i = 0; i < transcriptChunks.length; i++) {
        // Add previous summary to prompt if it exists for better results
        const messages = [];
        if (responses.length > 0) {
            for (let response of responses) {
                response = response.replace("\n", "");
                response = response.replace(",]", "]");
                const regex = /,\s*(?=])/g;
                response = response.replace(regex, "");
                const responseJson = JSON.parse(response);
                messages.push({role: "assistant", content: responseJson["summary"]});
            }
        }

        messages.push({
            role: "user",
            content: finalPrompt,
        });
        messages.push({
            role: "system",
            content: assistantPrompt,
        });

        try {
            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo-16k",
                messages: messages,
                temperature: 0.8,
                stop: null,
            });
            console.log(response);
            console.log(response.data.choices[0].message);
            responses.push(response.data.choices[0].message.content.trim());
        } catch (e) {
            console.log(e);
            return await summarizeText(text);
        }
    }
  return responses;
}

async function generatePdf(selectedOption, summaryJson, transcript, emailAddress) {
  // replace \n with nothing
  for (let i = 0; i < summaryJson.length; i++) {
    summaryJson[i] = summaryJson[i].replace("\n", "");
    summaryJson[i] = summaryJson[i].replace(",]", "]");
    const regex = /,\s*(?=])/g;
    summaryJson[i] = summaryJson[i].replace(regex, "");
  }

  console.log("Summary Json", summaryJson);
  const pdfJson = getPdfJson(summaryJson, selectedOption);
  console.log("PDF Json", pdfJson);

  // Generate PDF and send the mail
  try {
    await sendEmail(emailAddress ,pdfJson, transcript, )
  } catch (e) {
    console.log(e);
  }
}

export default audioToReport;
