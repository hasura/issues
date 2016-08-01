/* eslint-disable no-throw-literal */

import Express from 'express';
import http from 'http';
import morgan from 'morgan';
import schedule from 'node-schedule';
import fetch from 'node-fetch';

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
import {isToday, hasTimeSpent} from './email';
// import {isToday, sendEmail, hasTimeSpent} from './email';
import config from './config';
import {projects, USERS, GITLAB, GITHUB, PROJECTNAME, ACTIVE_MILESTONE, EMAIL_CRON,
  DEADLINES, INTERNAL_ENDPOINT, EXTERNAL_ENDPOINT, FROM_NAME} from './env';

const template = fs.readFileSync('./src/index.html');
const screenshotTemplate = fs.readFileSync('./src/screenshot.html');
const maintenanceEmail = fs.readFileSync('./src/email-maintenance.html');

const app = new Express();
const server = new http.Server(app);

if (global.__DEVELOPMENT__)
  app.use(morgan('combined'));
else
  app.use(morgan('[:date[clf]]: :method :url :status :res[content-length] - :response-time ms'));

app.use('/static', Express.static('./static'));

app.get('/email-screenshot/:milestone', (req, res) => {
  const milestone = req.params.milestone;
  const screenshotUrl = `${INTERNAL_ENDPOINT}/screenshot/${req.params.milestone}`;
  const filename = req.params.milestone + '-' + (new Date()).getTime().toString() + '.png';
  const dirFilename = './static/screenshots/' + filename;

  exec(('phantomjs bin/screencapture.js ' + screenshotUrl + ' ' + dirFilename + ' 1200 700'), (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).send('Email could not be sent, since screencapture failed');
    } else {
      console.log(`stdout: ${stdout}`);
      console.log(screenshotUrl);
      console.log(`stderr: ${stderr}`);

      const _deadline = new Date(DEADLINES[milestone].end);
      const deadline = _deadline.toDateString().toString().substr(0, 10);
      const subject = `Sprint update for the "${req.params.milestone}" milestone`;
      const content = `
        Hi,<br/><br/>
        For the <b>${req.params.milestone}</b> milestone ending on <b>${deadline}</b>, the sprint progress today is as below:<br/><br/>
        <img src="${EXTERNAL_ENDPOINT}/static/screenshots/${filename}" />
        <br/><br/>
        Regards,<br/>
        ${FROM_NAME}<br/><br/>
        --<br/>
        Powered by <a href="https://github.com/hasura/issues">hasura/issues</a>
        `;
      // sendEmail(subject, content);
      res.send(subject + '<br/>' + content);
    }
  });
});

app.get('/email/maintenance', (req, res) => {
  if ((projects.gitlab && projects.gitlab.length > 0) || (projects.github && projects.github.length > 0)) {
    const milestone = null;

    let totalOpenIssues = 0;
    const issuesOpenedToday = [];
    const issuesClosedToday = [];
    let allResults = [];

    /* ********* GITLAB **************** */
    console.log(`Fetching from gitlab: ${JSON.stringify(projects.gitlab)}`);
    const gitlabPromises = projects.gitlab.map((p) => (
      fetchFromGitlab(p, milestone, GITLAB, (data) => { // fetchFromGitlab returns a promise
        const _results = JSON.parse(data);
        const results = _results.map((issue) => mkFromGitlabIssue(issue, USERS, p));
        allResults = [...allResults, ...results];
      })));

    /* ********* GITHUB **************** */
    console.log('Fetching from github: ' + JSON.stringify(projects.github));
    const githubPromises = projects.github.map((p) => (
      fetchFromGithub(p, milestone, GITHUB, (data, projectName) => {
        const _results = JSON.parse(data);
        const results = _results.map(issue => mkFromGithubIssue(issue, USERS, projectName));
        allResults = [...allResults, ...results];
      })
    ));

    Promise.all(gitlabPromises.concat(githubPromises)).then(
      () => {
        try {
          allResults.map((issue) => { // eslint-disable-line array-callback-return
            if (issue.isOpen) {
              totalOpenIssues += 1;
            }
            if (isToday(issue.createdAt)) {
              issuesOpenedToday.push(issue);
            }
            if (isToday(issue.closedAt)) {
              issuesClosedToday.push(hasTimeSpent(issue));
            }
          });
          const output = mustache.render(maintenanceEmail.toString(), {
            projectName: PROJECTNAME,
            totalOpenIssues,
            issuesOpenedToday,
            noIssuesOpenedToday: issuesOpenedToday.length,
            issuesClosedToday,
            noIssuesClosedToday: issuesClosedToday.length
          });

          const subject = `Work update for ${PROJECTNAME}`;
          const content = `
            ${output}<br/><br/>
            Regards,<br/>
            ${FROM_NAME}<br/><br/>
            --<br/>
            Powered by <a href="https://github.com/hasura/issues">hasura/issues</a>`;

          // sendEmail(subject, content);
          res.send(subject + content);
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

// Schedule the emails to be sent out
schedule.scheduleJob(EMAIL_CRON, () => {
  console.log('\nRUNNING JOB:');
  if (ACTIVE_MILESTONE) {
    fetch(`${INTERNAL_ENDPOINT}/email-screenshot/${ACTIVE_MILESTONE}`).then(response => {
      console.log('Made request to send sprint email');
      if (response.status >= 200 && response.status < 300) {
        console.log('successfull');
        response.text().then(d => (console.log(d)));
      } else {
        console.error('fail');
        response.text().then(d => (console.error(d)));
      }
    });
  } else {
    fetch(`${INTERNAL_ENDPOINT}/email/maintenance`).then(response => {
      console.log('Made request to send maintenance email');
      if (response.status >= 200 && response.status < 300) {
        console.log('successful');
        response.text().then(d => (console.log(d)));
      } else {
        console.error('fail');
        response.text().then(d => (console.error(d)));
      }
    });
  }
});
