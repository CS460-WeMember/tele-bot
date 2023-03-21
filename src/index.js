//import got from 'got';
const services = require("./services");
const FormData = require("form-data");
var download = require("download-file");
const LocalFileData = require("get-file-object-from-local-path");
global.EventSource = require("eventsource");
const date = require("date-and-time");
var cron = require("node-cron");
const got = require("got");
var FileReader = require("filereader");
fileReader = new FileReader();

var lastUpdated = date.format(
  date.addHours(new Date(), -8),
  "YYYY-MM-DD HH:mm:ss.SSS"
);

//-----------------------------------------
// async function test1 () {
//   const list = await services.getRegular();
//   console.log(list);
// }
// test1();

//const fetch = require('cross-fetch/polyfill');
const fetch = require("node-fetch");
const PocketBase = require("pocketbase/cjs");
const fs = require("fs");
const request = require("request");
const path = require("path");

const telegramBot = require(`node-telegram-bot-api`);
const axios = require("axios");
require(`dotenv`).config();

const TOKEN = "6141320163:AAFQyt5yj0J9tpSTp6l8NjvyBsJNqz2NnQ4";

const client = new PocketBase("http://129.150.56.59:8090");
const url = "http://129.150.56.59:8090";
const bot = new telegramBot(TOKEN, { polling: true });
var caregiverChatId = "";
var userChatId = "122986982";

var roleFlag = 1;
var frequencyFlag = 1;
var soundLevelFlag = 1;
var lightColourFlag = 1;
var lightBrightnessFlag = 1;
var deviceFlag = 1;
var confirmationFlag = 1;
var settingsFlag = 1;
var toothbrushFlag = 1;

function resetReminderFlags() {
  frequencyFlag = 1;
  soundLevelFlag = 1;
  lightColourFlag = 1;
  lightBrightnessFlag = 1;
  deviceFlag = 1;
  confirmationFlag = 1;
}

function resetSettingsFlags() {
  settingsFlag = 1;
  toothbrushFlag = 1;
}

const options = {
  light: "FFFFFF",
  brightness: "low",
  sound: "low",
  confirmation: "no",
};

const formDataReminder = new FormData();
const reminder = {
  title: "temp title",
  when: "2023-01-23 10:00:00",
  device: "test",
};

var repeat = "None";

const reminder2 = {
  title: "temp title",
  when: "2022-01-01 10:00:00",
};

//keyboard buttons
const standardOpts = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [["Set A New Reminder"], ["My Reminders", "Settings"]],
  },
};

const startOpts = {
  reply_markup: {
    resize_keyboard: true,
    one_time_keyboard: true,
    keyboard: [["User", "Caregiver"]],
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
    keyboard: [
      ["Red", "Orange", "Yellow"],
      ["Green", "Blue", "Purple"],
      ["Pink", "White"],
    ],
  },
};

const deviceOpts = {
  reply_markup: {
    force_reply: true,
    resize_keyboard: true,
    keyboard: [
      ["Button 0", "Button 1"],
      ["Toothbrush Holder", "None"],
    ],
  },
};

const confirmationOpts = {
  reply_markup: {
    force_reply: true,
    resize_keyboard: true,
    keyboard: [["Yes", "No"]],
  },
};

const settingsOpts = {
  reply_markup: {
    force_reply: true,
    resize_keyboard: true,
    one_time_keyboard: true,
    keyboard: [["Brushing Teeth"], ["Back"]],
  },
};

client.collection("confirmations").subscribe("*", function (e) {
  console.log(e.record);
  const photourl =
    "http://129.150.56.59:8090/api/files/confirmations/" +
    e.record.id +
    "/" +
    e.record.image;
  console.log("====================================");
  console.log(photourl);
  console.log("====================================");
  async function sendPhoto() {
    const file = await fetch(photourl).then((res) => res.blob());
    bot.sendPhoto(caregiverChatId, Buffer.from(await file.arrayBuffer()), {
      caption: "Reminder Complete!",
    });
    console.log(Buffer.from(await file.arrayBuffer()));
    // const data = {
    //   "field": {
    //     "buffer": Buffer.from(await file.arrayBuffer())
    // }};
    // services.createTest(data);

    // const buff = await axios.get(
    //   "http://129.150.56.59:8090/api/collections/test/records"
    // );
    // console.log(buff.data.items[0].field.buffer);
    // bot.sendPhoto(caregiverChatId, buff.data.items[0].field.buffer, {
    //   caption: "Rremy the ratatoutelle",
    // });
  }
  sendPhoto();
});
var adhocReminderList = null;
var regularReminderList = null;

async function updateReminderLists() {
  adhocReminderList = await axios.get(
    "http://129.150.56.59:8090/api/collections/adhoc/records"
  );
  regularReminderList = await axios.get(
    "http://129.150.56.59:8090/api/collections/regular/records"
  );
}
updateReminderLists();

client.collection("adhoc").subscribe("*", function (e) {
  //console.log(e.record);
  // async function funky() {
  //   await updateReminderLists();
  //   //const tempDate = date.addHours(lastUpdated, -8);
  //   //const temp = date.format(tempDate,'YYYY-MM-DD HH:mm:ss.SSS');
  //   console.log(lastUpdated);
  //   for (var i = 0; i < adhocReminderList.data.items.length; i++) {
  //     var item = adhocReminderList.data.items[i];
  //     if (lastUpdated.localeCompare(item.created) != 1) {
  //       //schedule message
  //       console.log("heehee");
  //     }
  //   }
  //   lastUpdated = date.format(
  //     date.addHours(new Date(), -8),
  //     "YYYY-MM-DD HH:mm:ss.SSS"
  //   );
  //   console.log(lastUpdated);
  // }
  // funky();
  const newDate = new Date(e.record.when);
  const scheduleHour = newDate.getHours();
  const scheduleMinute = newDate.getMinutes();
  const scheduleDate = newDate.getDate();
  const scheduleMonth = newDate.getMonth() + 1;
  console.log(
    `${scheduleMinute} ${scheduleHour} ${scheduleDate} ${scheduleMonth} *`
  );
  cron.schedule(
    `${scheduleMinute} ${scheduleHour} ${scheduleDate} ${scheduleMonth} *`,
    () => {
      console.log("scheduled reminder:" + e.record.title);
      if (userChatId != "") {
        bot.sendMessage(userChatId, e.record.title);
      }
    }
  );
});

client.collection("regular").subscribe("*", function (e) {
  console.log(e.record);
  updateReminderLists();
  //make cron thing based on time
  var scheduleDay = e.record.day;
  if (scheduleDay == -1) {
    scheduleDay = "*";
  }
  const scheduleHour = e.record.hour;
  const scheduleMinute = e.record.minute;
  cron.schedule(`${scheduleMinute} ${scheduleHour} * * ${scheduleDay}`, () => {
    console.log("scheduled reminder:" + e.record.title);
    if (userChatId != "") {
      bot.sendMessage(userChatId, e.record.title);
    }
  });
});

bot.onText(/^\/start$/, function (msg) {
  caregiverChatId = msg.chat.id;
  bot.sendMessage(msg.chat.id, "Welcome to WeMember! Pick a role:", startOpts);
  roleFlag = 1;
  bot.on(`message`, async (roleMsg) => {
    if (roleFlag == 1) {
      if (roleMsg.text == "User") {
        userChatId = msg.chat.id;
        bot.sendMessage(msg.chat.id, "Welcome!");
      }
      if (roleMsg.text == "Caregiver") {
        caregiverChatId = msg.chat.id;
        bot.sendMessage(msg.chat.id, "Welcome!", standardOpts);
      }
    }
    roleFlag = 0;
  });
});

bot.on(`message`, (message) => {
  console.log(message);
  if (message.text == "Set A New Reminder") {
    (async () => {
      resetReminderFlags();
      const titlePrompt = await bot.sendMessage(
        message.chat.id,
        "Enter the title of your Reminder",
        {
          reply_markup: {
            force_reply: true,
          },
        }
      );
      bot.onReplyToMessage(
        caregiverChatId,
        titlePrompt.message_id,
        async (titleMsg) => {
          formDataReminder.append("title", titleMsg.text);
          reminder.title = titleMsg.text;
          const timePrompt = await bot.sendMessage(
            caregiverChatId,
            "When do you want the reminder to be?\nPlease enter the response in this format: 2023-01-23 10:00:00",
            {
              reply_markup: {
                force_reply: true,
              },
            }
          );
          bot.onReplyToMessage(
            caregiverChatId,
            timePrompt.message_id,
            async (timeMsg) => {
              reminder.when = timeMsg.text;
              const frequencyPrompt = await bot.sendMessage(
                caregiverChatId,
                "How often should this reminder be repeated?",
                frequencyOpts
              );
              bot.on(`message`, async (frequencyMsg) => {
                if (frequencyFlag == 1) {
                  frequencyFlag = 0;
                  repeat = frequencyMsg.text;
                  const photoPrompt = await bot.sendMessage(
                    caregiverChatId,
                    "Upload a photo for the reminder.\n",
                    {
                      reply_markup: {
                        force_reply: true,
                      },
                    }
                  );
                  bot.onReplyToMessage(
                    caregiverChatId,
                    photoPrompt.message_id,
                    async (photoMsg) => {
                      //reminder.photo = photoMsg.text;
                      console.log(photoMsg);
                      const photoId = photoMsg.photo[2].file_id;
                      console.log(photoId);
                      const res = await axios.get(
                        `https://api.telegram.org/bot6141320163:AAFQyt5yj0J9tpSTp6l8NjvyBsJNqz2NnQ4/getFile?file_id=${photoId}`
                      );
                      // extract the file path
                      const filePath = res.data.result.file_path;
                      console.log(filePath);
                      const downloadURL = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
                      console.log("====================================");
                      console.log(downloadURL);
                      console.log("====================================");

                      //const image = fs.createReadStream(downloadURL);
                      //console.log(image);
                      //formDataAdhoc.append("audio", image);
                      const file = await fetch(downloadURL);
                      const fileData = await file.blob();
                      //console.log(typeof file);
                      console.log("====================================");
                      console.log(
                        Buffer.from(await fileData.arrayBuffer()).toString(
                          "base64"
                        )
                      );
                      var b64string = Buffer.from(
                        await fileData.arrayBuffer()
                      ).toString("base64");
                      console.log("====================================");
                      //console.log(got.stream(downloadURL));
                      //formData.append("device", got.stream(downloadURL));
                      formDataReminder.append("picture2", b64string);
                      var buf = Buffer.from(b64string, "base64");
                      //formData.append("picture", file.value);
                      bot.sendPhoto(
                        caregiverChatId,
                        Buffer.from(await fileData.arrayBuffer()),
                        {
                          caption: "Reminder Complete!",
                        }
                      );

                      // const file = await fetch(downloadURL).then((res) =>
                      //   res.blob()
                      // );
                      // formDataAdhoc.append(
                      //   "picture",
                      //   Buffer.from(await file.arrayBuffer())
                      // );

                      // const formData = new FormData();
                      //formData.append("picture", file);

                      //=-----------------------------------------------------------------

                      //const urlToObject= async()=> {
                      //const response = await fetch(downloadURL);
                      // here image is url/location of image
                      //const blob = await response.blob();
                      // const file = new File([blob], 'image.jpg', {type: blob.type});
                      // console.log(file);
                      //formDataAdhoc.append("picture", blob);
                      //}
                      //urlToObject();

                      //reminder.photo = await axios.get(downloadURL);
                      //console.log(reminder.photo)
                      //formDataAdhoc.append("picture", downloadURL);
                      //bot.sendPhoto(caregiverChatId, downloadURL, {caption: "I'm a cool bot!"});

                      const audioPrompt = await bot.sendMessage(
                        caregiverChatId,
                        "Upload an audio clip for the reminder.",
                        {
                          reply_markup: {
                            force_reply: true,
                          },
                        }
                      );
                      bot.onReplyToMessage(
                        caregiverChatId,
                        audioPrompt.message_id,
                        async (audioMsg) => {
                          //process audio stuff
                          console.log(audioMsg);
                          const audioId = audioMsg.audio.file_id;
                          const res = await axios.get(
                             `https://api.telegram.org/bot${TOKEN}/getFile?file_id=${audioId}`
                           );
                          // extract the file path
                          const filePath = res.data.result.file_path;
                          console.log(filePath);
                          const downloadURL = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
                          console.log("====================================");
                          console.log(downloadURL);
                          console.log("====================================");
                          const file = await fetch(downloadURL);
                          const fileData = await file.blob();

                          console.log("====================================");
                          console.log(
                            Buffer.from(await fileData.arrayBuffer()).toString(
                              "base64"
                            )
                          );
                          var b64string = Buffer.from(
                            await fileData.arrayBuffer()
                          ).toString("base64");
                          console.log("====================================");

                          formDataReminder.append("audio2", b64string);

                          const soundLevelPrompt = await bot.sendMessage(
                            caregiverChatId,
                            "Choose the sound level to be played:",
                            levelOpts
                          );
                          bot.on(`message`, async (soundLevelMsg) => {
                            if (soundLevelFlag == 1) {
                              soundLevelFlag = 0;
                              options.sound = soundLevelMsg.text;
                              const lightColourPrompt = await bot.sendMessage(
                                caregiverChatId,
                                "Choose a light colour:",
                                colourOpts
                              );
                              bot.on(`message`, async (lightColourMsg) => {
                                if (lightColourFlag == 1) {
                                  lightColourFlag = 0;
                                  if (lightColourMsg == "Red") {
                                    options.light = "FF0000";
                                  }
                                  if (lightColourMsg == "Orange") {
                                    options.light = "FF8300";
                                  }
                                  if (lightColourMsg == "Yellow") {
                                    options.light = "FFF000";
                                  }
                                  if (lightColourMsg == "Green") {
                                    options.light = "00FF00";
                                  }
                                  if (lightColourMsg == "Blue") {
                                    options.light = "0046FF";
                                  }
                                  if (lightColourMsg == "Purple") {
                                    options.light = "AA00FF";
                                  }
                                  if (lightColourMsg == "Pink") {
                                    options.light = "FF00E0";
                                  }
                                  if (lightColourMsg == "White") {
                                    options.light = "FFFFFF";
                                  }
                                  const lightBrightnessPrompt =
                                    await bot.sendMessage(
                                      caregiverChatId,
                                      "Choose a brightness level:",
                                      levelOpts
                                    );
                                  bot.on(
                                    `message`,
                                    async (lightBrightnessMsg) => {
                                      if (lightBrightnessFlag == 1) {
                                        lightBrightnessFlag = 0;
                                        options.brightness =
                                          lightBrightnessMsg.text;
                                        const devicePrompt =
                                          await bot.sendMessage(
                                            caregiverChatId,
                                            "Choose a device to connect to this reminder:",
                                            deviceOpts
                                          );
                                        bot.on(`message`, async (deviceMsg) => {
                                          if (deviceFlag == 1) {
                                            deviceFlag = 0;
                                            if (deviceMsg != "None") {
                                              formDataReminder.append(
                                                "device",
                                                deviceMsg.text
                                              );
                                            }
                                            const confirmationPrompt =
                                              await bot.sendMessage(
                                                caregiverChatId,
                                                "Is a confirmation photo required for this reminder? ",
                                                confirmationOpts
                                              );
                                            bot.on(
                                              `message`,
                                              async (confirmationMsg) => {
                                                if (confirmationFlag == 1) {
                                                  confirmationFlag = 0;
                                                  options.confirmation =
                                                    confirmationMsg.text;
                                                  //createReminder
                                                  if (repeat == "Only Once") {
                                                    formDataReminder.append(
                                                      "when",
                                                      reminder.when
                                                    );
                                                    formDataReminder.append(
                                                      "options",
                                                      JSON.stringify(options)
                                                    );
                                                    services.createAdHoc(
                                                      formDataReminder
                                                    );
                                                    bot.sendMessage(
                                                      caregiverChatId,
                                                      "Reminder Created!",
                                                      standardOpts
                                                    );
                                                  }
                                                  if (
                                                    repeat == "Daily" ||
                                                    repeat == "Weekly"
                                                  ) {
                                                    if (repeat == "Daily") {
                                                      formDataReminder.append(
                                                        "day",
                                                        -1
                                                      );
                                                    }
                                                    if (repeat == "Weekly") {
                                                      const repeatdate =
                                                        new Date(reminder.when);
                                                      formDataReminder.append(
                                                        "day",
                                                        repeatdate.getDay()
                                                      );
                                                    }
                                                    formDataReminder.append(
                                                      "options",
                                                      JSON.stringify(options)
                                                    );
                                                    services.createRegular(
                                                      formDataRegular
                                                    );
                                                  }
                                                }
                                              }
                                            );
                                          }
                                        });
                                      }
                                    }
                                  );
                                }
                              });
                            }
                          });
                        }
                      );
                    }
                  );
                }
              });
            }
          );
        }
      );
    })();
  }
  if (message.text == "My Reminders") {
    (async () => {
      //api call to get all reminders
      //console.log(reminderList.data);

      //create message with titles of reminders
      var reminderListMessage = "Adhoc Reminders: \n";
      var count = adhocReminderList.data.items.length;
      var count2 = regularReminderList.data.items.length;
      //console.log(count);
      for (var i = 0; i < count; i++) {
        var item = adhocReminderList.data.items[i];
        reminderListMessage += item.title + "\n";
      }
      reminderListMessage += "\nRepeated Reminders: \n";
      for (var i = 0; i < count2; i++) {
        var item = regularReminderList.data.items[i];
        reminderListMessage += item.title + "\n";
      }

      bot.sendMessage(caregiverChatId, `${reminderListMessage}`, standardOpts);
    })();
  }
  if (message.text == "Settings") {
    resetSettingsFlags();
    bot.sendMessage(
      caregiverChatId,
      "Which setting do you want to change?",
      settingsOpts
    );
    bot.on(`message`, async (toothbrushMsg) => {
      if (toothbrushFlag == 1) {
        toothbrushFlag = 0;
        bot.sendMessage(
          caregiverChatId,
          "How long do you want this task to be?\nCurrent: 5 minutes"
        );
        bot.on(`message`, async (settingsMsg) => {
          if (settingsFlag == 1) {
            settingsFlag = 0;
            const toothbrushSettings = settingsMsg.text;
            //   const res = await axios.put("http://129.150.56.59:8090/api/collections/config/records?id=ecujwqgvtw8yxt0",
            //   {
            //     "field": "toothbrushminutes",
            //     "value": "6",
            //   }
            // );
            //console.log(res);
            bot.sendMessage(caregiverChatId, "Settings Updated!", standardOpts);
          }
        });
      }
    });
  }
});
