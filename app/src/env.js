/* eslint-disable no-throw-literal */

const GITHUB = process.env.GITHUB;
const GITLAB = process.env.GITLAB;
const DEADLINES = JSON.parse(process.env.DEADLINES);
const USERS = JSON.parse(process.env.USERS);
const PROJECTNAME = process.env.PROJECTNAME;

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

export {GITHUB, GITLAB, DEADLINES, USERS, projects, PROJECTNAME};
