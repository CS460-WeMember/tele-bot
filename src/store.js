//const PocketBase = require('pocketbase/cjs')
const fs = require('fs');
const request = require('request');
const path = require('path');

const telegramBot = require(`node-telegram-bot-api`);
const axios = require("axios");
require(`dotenv`).config();

const TOKEN = process.env.TOKEN;

//const client = new PocketBase('http://129.150.56.59:8090');
const bot = new telegramBot(TOKEN, { polling: true });

const options = {"light": "FFFFFF",
                  "brightness": "low",
                  "sound": "low"}

const reminder = {title: "temp title", 
                  when: "2023-01-23 10:00:0", 
                  "picture": "",
                  "options": options,
                  "audio": "filename.jpg",
                  "device": "test",
                  };

//keyboard buttons
const standardOpts = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [["Set A New Reminder"], ["My Reminders"]],
  },
};

const frequencyOpts = {
  reply_markup: {
    force_reply: true,
    resize_keyboard: true,
    keyboard: [["Only Once"], ["Daily"], ["Weekly"]],
  },
};

const levelOpts = {
  reply_markup: {
    force_reply: true,
    resize_keyboard: true,
    keyboard: [["Low", "Medium", "High"]],
  },
};

const colourOpts = {
  reply_markup: {
    force_reply: true,
    resize_keyboard: true,
    keyboard: [["Red", "Orange", "Yellow"], ["Green", "Blue", "Purple"], ["Pink", "White"]],
  },
};

bot.onText(/^\/start$/, function (msg) {
  bot.sendMessage(msg.chat.id, "Welcome to WeMember", standardOpts);
});

bot.on(`message`, (message) => {
  console.log(message);
  const chatId = message.chat.id;
  if (message.text == "Set A New Reminder") {
    (async () => {
      const titlePrompt = await bot.sendMessage(
        chatId,
        "Enter the title of your Reminder",
        {
          reply_markup: {
            force_reply: true,
          },
        }
      );
      bot.onReplyToMessage(chatId, titlePrompt.message_id, async (titleMsg) => {
        reminder.title = titleMsg.text;
        const timePrompt = await bot.sendMessage(
            chatId,
            "When do you want the reminder to be?\nPlease enter the response in this format: 2023-01-23 10:00:00",
            {
              reply_markup: {
                force_reply: true,
              },
            }
          );
          bot.onReplyToMessage(chatId, timePrompt.message_id, async (timeMsg) => {
            reminder.when = timeMsg.text;
            const frequencyPrompt = await bot.sendMessage(
                chatId,
                "How often should this reminder be repeated?", frequencyOpts
              );
              bot.on(`message`, async (frequencyMsg) => {
                reminder.device = frequencyMsg.text;
                const photoPrompt = await bot.sendMessage(
                    chatId,
                    "Upload a photo for the reminder.\n",
                    {
                      reply_markup: {
                        force_reply: true,
                      },
                    }
                  );
                  bot.onReplyToMessage(chatId, photoPrompt.message_id, async (photoMsg) => {
                    //reminder.photo = photoMsg.text;
                    //console.log(photoMsg);
                    const photoId = photoMsg.photo[0].file_id;
                    console.log(photoId);
                    const res = await axios.get(
                        `https://api.telegram.org/bot6141320163:AAFQyt5yj0J9tpSTp6l8NjvyBsJNqz2NnQ4/getFile?file_id=${photoId}`
                      );
                      // extract the file path
                    const filePath = res.data.result.file_path;
                    console.log(filePath);
                    const downloadURL = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

                    //reminder.photo = await axios.get(downloadURL);
                    //console.log(reminder.photo)
                    //bot.sendPhoto(chatId, reminder.photo, {caption: "I'm a cool bot!"});

                    const audioPrompt = await bot.sendMessage(
                      chatId,
                      "Upload an audio clip for the reminder.",
                      {
                        reply_markup: {
                          force_reply: true,
                        },
                      }
                    );
                    bot.onReplyToMessage(chatId, audioPrompt.message_id, async (audioMsg) => {
                      //process audio stuff
                      const soundLevelPrompt = await bot.sendMessage(
                        chatId,
                        "Choose the sound level to be played:", levelOpts
                      );
                      bot.onReplyToMessage(chatId, soundLevelPrompt.message_id, async (soundLevelMsg) => {
                        options.sound = soundLevelMsg.text;
                        const lightColourPrompt = await bot.sendMessage(
                          chatId,
                          "Choose a light colour:", colourOpts
                        );
                        bot.onReplyToMessage(chatId, lightColourPrompt.message_id, async (lightColourMsg) => {
                          options.light = lightColourMsg.text;
                          const lightBrightnessPrompt = await bot.sendMessage(
                            chatId,
                            "Choose a light colour:", levelOpts
                          );
                          bot.onReplyToMessage(chatId, lightBrightnessPrompt.message_id, async (lightBrightnessMsg) => {
                            options.brightness = lightBrightnessMsg.text;
                            
                          });
                        });
                      });
                    });
                  });
              });
          });
      });
    })();
  }
  if (message.text == "My Reminders") {
    (async () => {
    //api call to get all reminders
      const reminderList = await axios.get(
        "http://129.150.56.59:8090/api/collections/adhoc/records"
      );
      //console.log(reminderList.data);

    //create message with titles of reminders
      var reminderListMessage = "Current Reminders: \n\n";
      var count = reminderList.data.items.length;
      //console.log(count);
      for (var i = 0; i < count; i++) {
        var item = reminderList.data.items[i];
        reminderListMessage += item.title + "\n";
      }
      console.log(reminderListMessage);
      bot.sendMessage(chatId, `${reminderListMessage}`, standardOpts);
    })();
  }
});
