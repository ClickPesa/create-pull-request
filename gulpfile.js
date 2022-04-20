import gulp from "gulp";

gulp.task("createnotification", async () => {
  const options = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: ":sparkles:  New pull request for manual review on get-paid",
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            text: `<@null> <@null> <@null>  |  *get-paid*  |  *null}* `,
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
          text: `*<https://bitbucket.org/payclick/get-paid/pull-requests>*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `sample`,
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
            url: `https://bitbucket.org/payclick/get-paid/pull-requests`,
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
