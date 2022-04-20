const gulp = require("gulp");
const axios = require("axios");

gulp.task("createnotification", async () => {
  const options = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: ":sparkles:  New notification sent via github actions",
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            text: `<@null> <@null> <@null>  |  *engineering blog*  |  *null}* `,
            type: "mrkdwn",
          },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<https://github.com/clickpesa/engineering-blog/pulls>*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `sample from from github`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: "Review Changes",
            },
            style: "primary",
            url: "https://staging--getpaidafrica.netlify.app//",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: "View Pull Request",
            },
            url: `https://github.com/clickpesa/engineering-blog/pulls`,
          },
        ],
      },
    ],
  };

  axios
    .post(`${process.argv[4]}`, JSON.stringify(options))
    .then((response) => {
      console.log("SUCCEEDED: Sent slack webhook", response.data);
      resolve(response.data);
    })
    .catch((error) => {
      console.log("FAILED: Send slack webhook", error);
      reject(new Error("FAILED: Send slack webhook"));
    });
});
