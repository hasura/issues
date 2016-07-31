import Express from 'express';
// import path from 'path';
// import PrettyError from 'pretty-error';
import http from 'http';
import morgan from 'morgan';

import fetch from 'node-fetch';
import fs from 'fs';
import mustache from 'mustache';

import {mkFromGitlabMilestone, mkFromGitlabIssue,
  mkFromGithubIssue, mkFromGithubMilestone} from './issues';
import {issueCompare, createPersonLoadList, createTitle,
  countPerPerson, addToIssues, getDaysLeft} from './base';
import {initializeChartIssues, addToChartIssues} from './chart';
import config from './config';
import {projects, USERS, GITLAB, GITHUB, PROJECTNAME, DEADLINES} from './env';

const template = fs.readFileSync('./src/index.html');

const app = new Express();
const server = new http.Server(app);

if (global.__DEVELOPMENT__)
  app.use(morgan('combined'));
else
  app.use(morgan('[:date[clf]]: :method :url :status :res[content-length] - :response-time ms'));

app.use('/static', Express.static('./static'));

app.get('/milestone/:milestone', (req, res) => {
  if ((projects.gitlab && projects.gitlab.length > 0) || (projects.github && projects.github.length > 0)) {
    const milestone = req.params.milestone;

    let onlyUser = null;
    if (req.query.user) {
      onlyUser = req.query.user;
    }

    let chartIssues = initializeChartIssues(milestone);
    let allDepIssues = {};

    /* ********* GITLAB **************** */
    console.log(`Fetching from gitlab: ${JSON.stringify(projects.gitlab)}`);
    let people = {};
    const gitlabIssues = [];
    let totalGitlab = 0;
    const gitlabPromises = projects.gitlab.map((p, i) => {
      const promise = new Promise((resolve, reject) => {
        fetch(`https://gitlab.com/api/v3/projects/${p.replace('/', '%2F')}/issues?milestone=${milestone}`,
          {headers: {
            'Content-Type': 'application/json',
            'PRIVATE-TOKEN': `${GITLAB}`
          }}).then(
            (response) => {
              if (response.status >= 200 && response.status < 300) {
                response.text().then((data) => {
                  try {
                    const _results = JSON.parse(data);
                    const results = _results.map((issue) => mkFromGitlabIssue(issue, USERS));

                    let issues = [];
                    results.map((issue) => { // eslint-disable-line array-callback-return
                      // Add to main issues datastructure
                      issues = addToIssues(issue, issues, onlyUser);

                      // Increase counter
                      people = countPerPerson(issue, people);

                      // Add to the chart issues data structre
                      chartIssues = addToChartIssues(issue, chartIssues, onlyUser);

                      // Update the blocking issue data structure
                      // allDepIssues = updateAllBlockers(issue, allDepIssues);
                    });

                    gitlabIssues.push({
                      project: p,
                      projectNo: i,
                      noIssues: issues.length,
                      issues,
                      milestone: mkFromGitlabMilestone(results, milestone)
                    });
                    totalGitlab += issues.length;

                    resolve();
                  } catch (err) {
                    console.log(err.stack);
                    reject(err.toString());
                  }
                });
                return;
              }
              reject(p + ':: ' + response.status.toString() + ': ' + response.statusText);
            },
            (error) => {
              reject(p + ':: failed to fetch from gitlab: ' + error.message);
            }
          );
      });
      return promise;
    });

    /* ********* GITHUB **************** */
    console.log('Fetching from github: ' + JSON.stringify(projects.github));
    const githubIssues = [];
    let totalGithub = 0;
    const githubPromises = projects.github.map((p, i) => {
      const projectName = p.name;
      const milestoneId = p.milestones[milestone];
      const promise = new Promise((resolve, reject) => {
        fetch(`https://api.github.com/repos/${projectName}/issues?milestone=${milestoneId}&state=open`,
          {headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${GITHUB}`
          }}).then(
            (response) => {
              if (response.status >= 200 && response.status < 300) {
                response.text().then((data) => {
                  try {
                    const _results = JSON.parse(data);
                    const results = _results.map(issue => mkFromGithubIssue(issue));

                    let issues = [];
                    results.map((issue) => { // eslint-disable-line array-callback-return
                      // Add to main issues datastructure
                      issues = addToIssues(issue, issues, onlyUser);

                      // Increase counter
                      people = countPerPerson(issue, people);

                      // Add to the chart issues data structre
                      chartIssues = addToChartIssues(issue, chartIssues, onlyUser);

                      // Update the blocking issue data structure
                      // allDepIssues = updateAllBlockers(issue, allDepIssues);
                    });

                    githubIssues.push({
                      project: projectName,
                      projectNo: i,
                      noIssues: issues.length,
                      issues,
                      milestone: mkFromGithubMilestone(results, milestone, milestoneId)
                    });
                    totalGithub += issues.length;
                    resolve();
                  } catch (err) {
                    console.log(err.stack);
                    reject(err.toString());
                  }
                });
                return;
              }
              reject(p + ':: ' + response.status.toString() + ': ' + response.statusText);
            },
            (error) => {
              reject(p + ':: failed to fetch from github: ' + error.message);
            }
          );
      });
      return promise;
    });

    Promise.all(gitlabPromises.concat(githubPromises)).then(
      () => {
        // Assemble stats
        try {
          // Sort according to number of issues
          gitlabIssues.sort(issueCompare);
          githubIssues.sort(issueCompare);

          // Compile per person list
          const totalTasks = totalGitlab + totalGithub;
          const personLoadList = createPersonLoadList(people, totalTasks);

          // Computation for stuff that goes on the header
          const deadline = new Date(DEADLINES[milestone].end);
          const daysLeft = getDaysLeft(deadline);
          const runRate = Math.ceil(totalTasks / daysLeft);

          // HTML <title>
          const title = createTitle(onlyUser, milestone, PROJECTNAME);

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
            blockers: [],  // blockerIssues,
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
