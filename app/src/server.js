/* eslint-disable no-throw-literal */

import Express from 'express';
import http from 'http';
import morgan from 'morgan';

import fs from 'fs';
import mustache from 'mustache';

import {exec} from 'child_process';

import {mkFromGitlabMilestone, mkFromGitlabIssue,
  mkFromGithubIssue, mkFromGithubMilestone,
  fetchFromGitlab, fetchFromGithub} from './issues';
import {issueCompare, createPersonLoadList, createTitle,
  countPerPerson, addToIssues, getDaysLeft} from './base';
import {initializeChartIssues, addToChartIssues} from './chart';
import {updateAllBlockers, createBlockerIssues} from './blockers';
import config from './config';
import {projects, USERS, GITLAB, GITHUB, PROJECTNAME, DEADLINES} from './env';

const template = fs.readFileSync('./src/index.html');
const screenshotTemplate = fs.readFileSync('./src/screenshot.html');

const app = new Express();
const server = new http.Server(app);

if (global.__DEVELOPMENT__)
  app.use(morgan('combined'));
else
  app.use(morgan('[:date[clf]]: :method :url :status :res[content-length] - :response-time ms'));

app.use('/static', Express.static('./static'));

app.get('/email/:milestone', (req, res) => {
  const screenshotUrl = `${req.protocol}://${req.hostname}:${config.port}/screenshot/${req.params.milestone}`;
  const filename = './static/screenshots/' + req.params.milestone + '-' + (new Date()).getTime().toString() + '.png';
  exec(('phantomjs bin/screencapture.js ' + screenshotUrl + ' ' + filename + ' 1200 700'), (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).send('Email could not be sent, since screencapture failed');
    } else {
      console.log(`stdout: ${stdout}`);
      console.log(screenshotUrl);
      console.log(`stderr: ${stderr}`);
      res.send('Email sent');
    }
  });
});

app.get('/email/:milestone', (req, res) => {
  const screenshotUrl = `${req.protocol}://${req.hostname}:${config.port}/screenshot/${req.params.milestone}`;
  const filename = './static/screenshots/' + req.params.milestone + '-' + (new Date()).getTime().toString() + '.png';
  exec(('phantomjs bin/screencapture.js ' + screenshotUrl + ' ' + filename + ' 1200 700'), (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).send('Email could not be sent, since screencapture failed');
    } else {
      console.log(`stdout: ${stdout}`);
      console.log(screenshotUrl);
      console.log(`stderr: ${stderr}`);
      res.send('Email sent');
    }
  });
});

app.get('/screenshot/:milestone', (req, res) => {
  if ((projects.gitlab && projects.gitlab.length > 0) || (projects.github && projects.github.length > 0)) {
    const milestone = req.params.milestone;

    let chartIssues = initializeChartIssues(DEADLINES, milestone);

    /* ********* GITLAB **************** */
    console.log(`Fetching from gitlab: ${JSON.stringify(projects.gitlab)}`);
    const gitlabPromises = projects.gitlab.map((p) => (
      fetchFromGitlab(p, milestone, GITLAB, (data) => { // fetchFromGitlab returns a promise
        const _results = JSON.parse(data);
        const results = _results.map((issue) => mkFromGitlabIssue(issue, USERS, p));

        results.map((issue) => { // eslint-disable-line array-callback-return
          // Add to the chart issues data structre
          chartIssues = addToChartIssues(issue, chartIssues);
        });
      })));

    /* ********* GITHUB **************** */
    console.log('Fetching from github: ' + JSON.stringify(projects.github));
    const githubPromises = projects.github.map((p) => (
      fetchFromGithub(p, milestone, GITHUB, (data, projectName) => {
        const _results = JSON.parse(data);
        const results = _results.map(issue => mkFromGithubIssue(issue, USERS, projectName));

        results.map((issue) => { // eslint-disable-line array-callback-return
          // Add to the chart issues data structre
          chartIssues = addToChartIssues(issue, chartIssues);
        });
      })
    ));

    Promise.all(gitlabPromises.concat(githubPromises)).then(
      () => {
        try {
          // HTML <title>
          const title = createTitle(PROJECTNAME, milestone);
          const output = mustache.render(screenshotTemplate.toString(), {
            title,
            allIssues: JSON.stringify(chartIssues)
          });
          res.send(output);
        } catch (err) {
          console.log(err.stack);
          res.send(err);
        }
      },
      (error) => {
        res.send(error);
      });
  } else {
    res.send('No projects specified');
  }
});

app.get('/milestone/:milestone', (req, res) => {
  if ((projects.gitlab && projects.gitlab.length > 0) || (projects.github && projects.github.length > 0)) {
    const milestone = req.params.milestone;

    let onlyUser = null;
    if (req.query.user) {
      onlyUser = req.query.user;
    }

    let chartIssues = initializeChartIssues(DEADLINES, milestone);
    let allDepIssues = {};

    /* ********* GITLAB **************** */
    console.log(`Fetching from gitlab: ${JSON.stringify(projects.gitlab)}`);
    let people = {};
    const gitlabIssues = [];
    let totalGitlab = 0;
    const gitlabPromises = projects.gitlab.map((p, i) => (
      fetchFromGitlab(p, milestone, GITLAB, (data) => { // fetchFromGitlab returns a promise
        const _results = JSON.parse(data);
        const results = _results.map((issue) => mkFromGitlabIssue(issue, USERS, p));

        let issues = [];
        results.map((issue) => { // eslint-disable-line array-callback-return
          // Add to main issues datastructure
          issues = addToIssues(issue, issues, onlyUser);

          // Increase counter
          people = countPerPerson(issue, people);

          // Add to the chart issues data structre
          chartIssues = addToChartIssues(issue, chartIssues, onlyUser);

          // Update the blocking issue data structure
          allDepIssues = updateAllBlockers(issue, allDepIssues, p, 'gitlab');
        });

        gitlabIssues.push({
          project: p,
          projectNo: i,
          noIssues: issues.length,
          issues,
          milestone: mkFromGitlabMilestone(results, milestone, p)
        });
        totalGitlab += issues.length;
      })));

    /* ********* GITHUB **************** */
    console.log('Fetching from github: ' + JSON.stringify(projects.github));
    const githubIssues = [];
    let totalGithub = 0;
    const githubPromises = projects.github.map((p, i) => (
      fetchFromGithub(p, milestone, GITHUB, (data, projectName, milestoneId) => {
        const _results = JSON.parse(data);
        const results = _results.map(issue => mkFromGithubIssue(issue, USERS, projectName));

        let issues = [];
        results.map((issue) => { // eslint-disable-line array-callback-return
          // Add to main issues datastructure
          issues = addToIssues(issue, issues, onlyUser);

          // Increase counter
          people = countPerPerson(issue, people);

          // Add to the chart issues data structre
          chartIssues = addToChartIssues(issue, chartIssues, onlyUser);

          // Update the blocking issue data structure
          allDepIssues = updateAllBlockers(issue, allDepIssues, projectName, 'github');
        });

        githubIssues.push({
          project: projectName,
          projectNo: i,
          noIssues: issues.length,
          issues,
          milestone: mkFromGithubMilestone(projectName, milestone, milestoneId)
        });
        totalGithub += issues.length;
      })
    ));

    Promise.all(gitlabPromises.concat(githubPromises)).then(
      () => {
        // Assemble stats
        try {
          // Sort according to number of issues
          gitlabIssues.sort(issueCompare);
          githubIssues.sort(issueCompare);

          // Compile per person list
          const totalTasks = totalGitlab + totalGithub;
          const personLoadList = createPersonLoadList(people, totalTasks, onlyUser);

          // Computation for stuff that goes on the header
          const deadline = new Date(DEADLINES[milestone].end);
          const daysLeft = getDaysLeft(deadline);
          const runRate = Math.ceil(totalTasks / daysLeft);

          // HTML <title>
          const title = createTitle(PROJECTNAME, milestone, onlyUser);

          // Create all the blocker issues from the issue dependency data structure
          const blockerIssues = createBlockerIssues(allDepIssues, onlyUser);

          const output = mustache.render(template.toString(), {
            deadline: deadline.toDateString().toString().substr(0, 11),
            totalTasks,
            daysLeft,
            runRate,
            gitlab: gitlabIssues,
            totalGitlab,
            github: githubIssues,
            totalGithub,
            people: personLoadList,
            expanded: (onlyUser ? ' in' : ''),
            title,
            milestone,
            blockers: blockerIssues,
            totalBlockers: blockerIssues.length,
            allIssues: JSON.stringify(chartIssues)
          });
          res.send(output);
        } catch (err) {
          console.log(err.stack);
          res.send(err);
        }
      },
      (error) => {
        res.send(error);
      });
  } else {
    res.send('No projects specified');
  }
});


// Listen at the server
if (config.port) {
  server.listen(config.port, config.host, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> ✅  %s is running, talking to API server.', config.app.title);
    console.info('==> 💻  Open http://%s:%s in a browser to view the app.', config.host, config.port);
  });
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
