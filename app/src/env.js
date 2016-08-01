/* eslint-disable no-throw-literal */

const GITHUB = process.env.GITHUB;
const GITLAB = process.env.GITLAB;
const DEADLINES = JSON.parse(process.env.DEADLINES);
const USERS = JSON.parse(process.env.USERS);
const PROJECTNAME = process.env.PROJECTNAME;
const INTERNAL_ENDPOINT = process.env.INTERNAL_ENDPOINT;
const EXTERNAL_ENDPOINT = process.env.EXTERNAL_ENDPOINT;
const FROM_NAME = process.env.FROM_NAME;
const FROM_EMAIL = process.env.FROM_EMAIL;
const TO_EMAILS = process.env.TO_EMAILS;
const SPARKPOST_KEY = process.env.SPARKPOST_KEY;
const ACTIVE_MILESTONE = process.env.ACTIVE_MILESTONE;
const EMAIL_CRON = process.env.EMAIL_CRON;

if (!EMAIL_CRON) {
  throw 'ENV var EMAIL_CRON expected, but not found';
}

if (!FROM_NAME || !FROM_EMAIL || !TO_EMAILS || !SPARKPOST_KEY) {
  throw 'ENV var FROM_NAME, FROM_EMAIL, TO_EMAILS & SPARKPOST_KEY expected, but not found';
}

if (!INTERNAL_ENDPOINT || !EXTERNAL_ENDPOINT) {
  throw 'ENV var INTERNAL_ENDPOINT & EXTERNAL_ENDPOINT expected, but not found';
}

// Perform some basic validation on configuration
if (!(process.env.PROJECTS)) {
  throw 'ENV var PROJECTS expected, but not found';
}

const projects = JSON.parse(process.env.PROJECTS);

if (projects.github && !GITHUB) {
  throw `Need GITHUB env var
    for processing github projects`;
}
if (projects.gitlab && !GITLAB) {
  throw `Need GITLAB env var
    for processing gitlab projects`;
}

export {GITHUB, GITLAB, DEADLINES, USERS,
  projects, PROJECTNAME,
  INTERNAL_ENDPOINT, EXTERNAL_ENDPOINT,
  TO_EMAILS, FROM_EMAIL, FROM_NAME,
  SPARKPOST_KEY, ACTIVE_MILESTONE, EMAIL_CRON};
